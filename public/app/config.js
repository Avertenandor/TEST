export const CONFIG = {
  network: {
    chainId: 56,
    rpc: [
      // QuikNode (HTTP & WSS)
      "https://old-patient-butterfly.bsc.quiknode.pro/033086e8e5a0217bb0b15a808dd70bc4e3e025af",
      "https://bsc-dataseed.binance.org/"
    ],
    wss:
      "wss://old-patient-butterfly.bsc.quiknode.pro/033086e8e5a0217bb0b15a808dd70bc4e3e025af"
  },
  addresses: {
    // Системный адрес для авторизации (получатель 1 PLEX)
    auth: "0x399B22170B0AC7BB20bdC86772BfF478f201fFCD",
    access: "0x28915a33562b58500cf8b5b682C89A3396B8Af76",
    plexToken: "0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1"
  },
  token: {
    symbol: "PLEX",
    decimals: 9,
    authAmount: "1"
  },
  flags: { debug: false }
};