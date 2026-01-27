package org.example.cardanopayroll.model;

public class SignedTxRequest {
    private String signedTxCbor;
    public String getSignedTxCbor() { return signedTxCbor; }
    public void setSignedTxCbor(String signedCBORhex) { this.signedTxCbor = signedCBORhex; }
}
