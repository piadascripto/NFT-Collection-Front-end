import React, { useEffect, useState } from "react"
import "./styles/App.css"
import twitterLogo from "./assets/twitter-logo.svg"
import { ethers } from "ethers"
import myEpicNft from "./utils/MyEpicNFT.json"

// Constants
const TWITTER_HANDLE = "piadascripto"
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

// Eu movi o endereço do contrato para cima para ficar fácil acessar
const CONTRACT_ADDRESS = "0x793414D4816A95389D9491cFDa3a939D1bFDad7e"

const App = () => {
  /*
   * Só uma variável de estado que usamos pra armazenar nossa carteira pública. Não esqueça de importar o useState.
   */


  const [currentAccount, setCurrentAccount] = useState("")
  
    const [openseaLink, setOpenseaLink] = useState(""); // Add a state variable to store the OpenSea link
  
  const checkIfWalletIsConnected = async () => {
    /*
     * Primeiro tenha certeza que temos acesso a window.ethereum
     */
    const { ethereum } = window
    if (!ethereum) {
      console.log("Install Metamask")
      return
    } else {
      console.log("Temos o objeto ethereum!", ethereum)
    }
    /*
     * Checa se estamos autorizados a carteira do usuário.
     */
    const accounts = await ethereum.request({ method: "eth_accounts" })
    /*
     * Usuário pode ter múltiplas carteiras autorizadas, nós podemos pegar a primeira que está lá!
     */
    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log("Encontrou uma conta autorizada:", account)
      setCurrentAccount(account)

      // Setup listener! Isso é para quando o usuário vem no site
      // e já tem a carteira conectada e autorizada
      setupEventListener()
    } else {
      console.log("Nenhuma conta autorizada foi encontrada")
    }
  }
  const connectWallet = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        alert("Please install Metamask!")
        return
      }
      /*
       * Método chique para pedir acesso a conta.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      })
      /*
       * Boom! Isso deve escrever o endereço público uma vez que autorizar o Metamask.
       */
      console.log("Conectado", accounts[0])
      setCurrentAccount(accounts[0])

      // Setup listener! Para quando o usuário vem para o site
      // e conecta a carteira pela primeira vez
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  // Setup do listener.
   // Setup do listener.
  const setupEventListener = async () => {
    // é bem parecido com a função
    try {
      const { ethereum } = window

      if (ethereum) {
        // mesma coisa de novo
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        // Aqui está o tempero mágico.
        // Isso essencialmente captura nosso evento quando o contrato lança
        // Se você está familiar com webhooks, é bem parecido!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(
            `Hi, your NFT was minted...please access <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>`
          )
        })

        console.log("Setup event listener!")
      } else {
        console.log("Objeto ethereum não existe!")
      }
    } catch (error) {
      console.log(error)
    }
  }

const askContractToMintNft = async () => {
  try {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

      console.log("Vai abrir a carteira agora para pagar o gás...");
      let nftTxn = await connectedContract.makeAnEpicNFT();
      console.log("Cunhando...espere por favor.");
      await nftTxn.wait();
      const tokenId = await connectedContract.getTokenId();
      const link = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`;
      console.log(`Minted! Here is the link: ${link}`);
      setOpenseaLink(link); // Set the OpenSea link in the state variable
    }
  } catch (error) {
    console.log(error);
  }
};

  // Métodos para Renderizar
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect Metamask
    </button>
  )
  /*
   * Isso roda nossa função quando a página carrega.
   */
  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <img height="300px" src="https://i.imgur.com/DL9Zm3J.jpg"/>
          <p className="header gradient-text">Mint an investing strategy</p>
          <p className="sub-text">Crypto experts showing their investing strategies in NFT format. </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
          {openseaLink && ( // Only render the link if it exists
        <a href={openseaLink} target="_blank" rel="noreferrer">
          See the NFT in OpenSea
        </a>
      )}
        </div>
        <div>
        <a
            className="footer-text"
            href="https://testnets.opensea.io/collection/cryptoinvestorsnft"
            target="_blank"
            rel="noreferrer"
          >🌊 Show all minted strategies</a>
        
        
        </div>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`Created by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}

export default App