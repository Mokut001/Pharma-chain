{-# LANGUAGE DataKinds           #-}
{-# LANGUAGE DeriveAnyClass      #-}
{-# LANGUAGE DeriveGeneric       #-}
{-# LANGUAGE FlexibleContexts    #-}
{-# LANGUAGE NoImplicitPrelude   #-}
{-# LANGUAGE OverloadedStrings   #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE TemplateHaskell     #-}
{-# LANGUAGE TypeApplications    #-}
{-# LANGUAGE TypeFamilies        #-}
{-# LANGUAGE TypeOperators       #-}

module PharmaChain where

import           Plutus.V2.Ledger.Api
import           Plutus.V2.Ledger.Contexts (txSignedBy, ownCurrencySymbol)
import qualified PlutusTx
import           PlutusTx.Prelude          hiding (Semigroup (..), unless)
import           Prelude                  (Show (..))

-- | Medication Batch Parameters
data PharmaParams = PharmaParams
    { manufacturerPkh :: PubKeyHash
    } deriving Show

PlutusTx.makeLift ''PharmaParams

{-# INLINABLE mkPharmaPolicy #-}
mkPharmaPolicy :: PharmaParams -> () -> ScriptContext -> Bool
mkPharmaPolicy params _ ctx = 
    traceIfFalse "Not signed by Manufacturer" (txSignedBy (scriptContextTxInfo ctx) (manufacturerPkh params)) 
    && traceIfFalse "Must mint exactly 1 unit of medicine token" checkMintedAmount
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx

    checkMintedAmount :: Bool
    checkMintedAmount = case flattenValue (txInfoMint info) of
        [(_, _, amt)] -> amt == 1
        _             -> False

policy :: PharmaParams -> MintingPolicy
policy params = mkMintingPolicyScript 
    ($$(PlutusTx.compile [|| mkPharmaPolicy ||]) `PlutusTx.applyCode` PlutusTx.liftCode params)