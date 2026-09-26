import React, {useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {ConnectionProvider, WalletProvider, useConnection, useWallet} from "@solana/wallet-adapter-react";
import {WalletModalProvider, WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {PhantomWalletAdapter, SolflareWalletAdapter, BackpackWalletAdapter} from "@solana/wallet-adapter-wallets";
import {clusterApiUrl, Keypair, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import {createMint, getOrCreateAssociatedTokenAccount, mintTo} from "@solana/spl-token";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./styles.css";

const DEVNET = clusterApiUrl("devnet");

function short(pk){const s=pk?.toString?.()||""; return s ? `${s.slice(0,5)}…${s.slice(-5)}` : ""}

function LaunchPanel(){
  const {connection}=useConnection();
  const {publicKey, sendTransaction, connected}=useWallet();
  const [name,setName]=useState("PixelX Genesis");
  const [symbol,setSymbol]=useState("PXLX");
  const [supply,setSupply]=useState("1000000000");
  const [decimals,setDecimals]=useState("6");
  const [autoNFT,setAutoNFT]=useState(true);
  const [nftSupply,setNftSupply]=useState("5000");
  const [status,setStatus]=useState("");
  const [mintAddress,setMintAddress]=useState("");

  async function createToken(){
    if(!publicKey){setStatus("Connect a Solana wallet first.");return}
    try{
      setStatus("Creating token mint on Solana Devnet…");
      const mint=await createMint(connection, {publicKey, sendTransaction}, publicKey, null, Number(decimals));
      const ata=await getOrCreateAssociatedTokenAccount(connection,{publicKey,sendTransaction},mint,publicKey);
      const amount=BigInt(supply)*BigInt(10)**BigInt(decimals);
      const sig=await mintTo(connection,{publicKey,sendTransaction},mint,ata.address,publicKey,amount);
      setMintAddress(mint.toBase58());
      setStatus(`Token created. Transaction: ${sig}`);
    }catch(e){
      console.error(e);
      setStatus(`Launch failed: ${e?.message||e}`);
    }
  }

  return <div className="launchbox">
    <div className="launch-title"><div><span className="eyebrow">DEVNET MODE</span><h2>Create your launch</h2><p>Real wallet signing and real SPL token creation on Solana Devnet.</p></div><div className="live">● LIVE</div></div>
    <div className="fields">
      <label>Token name<input value={name} onChange={e=>setName(e.target.value)}/></label>
      <label>Ticker<input value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())}/></label>
      <label>Total supply<input type="number" value={supply} onChange={e=>setSupply(e.target.value)}/></label>
      <label>Decimals<input type="number" min="0" max="9" value={decimals} onChange={e=>setDecimals(e.target.value)}/></label>
    </div>
    <div className="switchrow">
      <div><b>🖼️ PixelX Auto-NFT</b><small>Prepare a companion NFT collection for this token.</small></div>
      <button className={autoNFT?"switch on":"switch"} onClick={()=>setAutoNFT(!autoNFT)}><span/></button>
    </div>
    {autoNFT && <div className="nftrow"><label>NFT collection<input value={`${name} Genesis`} readOnly/></label><label>NFT supply<input type="number" value={nftSupply} onChange={e=>setNftSupply(e.target.value)}/></label></div>}
    <div className="review"><div><span>Wallet</span><b>{connected?short(publicKey):"Not connected"}</b></div><div><span>Network</span><b>Solana Devnet</b></div><div><span>Mint</span><b>{mintAddress?short(new PublicKey(mintAddress)):"Not created"}</b></div></div>
    <button className="launchbtn" onClick={createToken}>{connected?"🚀 Create SPL Token":"🔗 Connect Wallet First"}</button>
    {status && <div className="status">{status}{status.includes("Transaction:")&&<><br/><a target="_blank" href={`https://explorer.solana.com/tx/${status.split("Transaction: ")[1]}?cluster=devnet`}>View transaction on Solana Explorer →</a></>}</div>}
  </div>
}

function App(){
 const wallets=useMemo(()=>[new PhantomWalletAdapter(),new SolflareWalletAdapter(),new BackpackWalletAdapter()],[]);
 return <ConnectionProvider endpoint={DEVNET}><WalletProvider wallets={wallets} autoConnect><WalletModalProvider>
  <div className="app">
   <nav><div className="brand"><i/>PIXELX</div><div className="navlinks"><a href="#explore">Explore</a><a href="#features">Features</a><a href="#launch">Launch</a></div><WalletMultiButton/></nav>
   <main>
    <section className="hero"><div><div className="eyebrow">SOLANA TOKEN + AUTO-NFT LAUNCHPAD</div><h1>Launch a token.<br/><em>Build its world.</em></h1><p>PixelX is a creator-first Solana launchpad where a token and its companion NFT ecosystem can be configured in one launch flow.</p><div className="actions"><a className="primary" href="#launch">Create Token + NFT</a><a href="#explore">Explore launches</a></div><div className="stats"><span><b>1,284+</b> launches</span><span><b>8,421</b> NFTs</span><span><b>Devnet</b> testing</span></div></div>
    <div className="hero-card"><div className="cardtop"><span>PIXELX / PXLX</span><b>LIVE</b></div><div className="bigprice">$0.000182</div><div className="green">+24.82%</div><div className="chart"><svg viewBox="0 0 500 150" preserveAspectRatio="none"><path d="M0 125 C40 120 55 92 90 106 S130 74 160 92 S205 50 240 75 S285 90 320 45 S360 65 400 27 S445 45 500 8" fill="none" stroke="url(#g)" stroke-width="4"/><defs><linearGradient id="g"><stop stop-color="#62f7b0"/><stop offset="1" stop-color="#9b7cff"/></linearGradient></defs></svg></div><div className="cards"><span>Market cap<strong>$182K</strong></span><span>Holders<strong>2,481</strong></span><span>Auto-NFT<strong>5,000</strong></span></div></div></section>
    <section id="launch"><LaunchPanel/></section>
    <section id="explore"><h2>Trending launches</h2><p className="muted">Discovery UI for tokens and their companion NFT ecosystems.</p><div className="grid">{["PixelX Genesis","AstroByte","Froggy Pixel"].map((x,i)=><div className="token" key={x}><div className="avatar">{i===0?"PX":i===1?"AI":"F"}</div><div><b>{x}</b><small>${i===0?"PXLX":i===1?"ABYTE":"FROG"}</small></div><strong>{i===0?"$182K":i===1?"$94K":"$641K"}</strong></div>)}</div></section>
    <section id="features"><h2>Built around the launch</h2><div className="features">{[["🚀","One-click SPL token","Create and mint a real SPL token on Devnet."],["🖼️","Auto-NFT companion","Configure the NFT layer at the same time as the token."],["👛","Multi-wallet","Phantom, Solflare and Backpack through Wallet Adapter."],["🔐","Transparent authorities","Show who controls minting and account permissions."],["📊","Creator analytics","Track holders, volume and NFT claims."],["🎓","Graduation","Connect future bonding-curve/DEX logic here."]].map(f=><article><i>{f[0]}</i><h3>{f[1]}</h3><p>{f[2]}</p></article>)}</div></section>
   </main>
   <footer>© 2026 PixelX · Solana Devnet prototype</footer>
  </div>
 </WalletModalProvider></WalletProvider></ConnectionProvider>
}
createRoot(document.getElementById("root")).render(<App/>);
