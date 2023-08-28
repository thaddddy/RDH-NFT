import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { 
	Flex,
	Image,
	Text,
  	ChakraProvider,
	Spinner,
} from "@chakra-ui/react";
import "./App.scss";
import "./mdi/css/materialdesignicons.css";
import Aos from "aos";
import "aos/dist/aos.css";
import icon from "./icon.png";
import img1 from "./img1.png";
import img2 from "./img2.png";
import founder1 from "./founder1.png";
import founder2 from "./founder2.png";
import founder3 from "./founder3.png";
import founder4 from "./founder4.png";
import founder3small from "./founder3small.png";
import show1 from "./show1.png";
import show2 from "./show2.png";
import show3 from "./show3.png";
import show4 from "./show4.png";
import show5 from "./show5.png";
import show6 from "./show6.png";
import show7 from "./show7.png";
import show8 from "./show8.png";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { pinJSONToIPFS } from './pinata.js';
import { ethers } from "ethers";

require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(alchemyKey);
const contractABI = require('./contract-abi.json');
const contractAddress = "0x80a25Fa838BD3123ACcFaf1A6Fbe2c99D963f697";
const nftContract = new web3.eth.Contract(contractABI, contractAddress)

function App() {
	const [isConnected, setIsConnected] = useState(false)
	const [userAddress, setUserAddress] = useState("")
	const [loading, setLoading] = useState(false)
	const [funcRes, setFuncRes] = useState("")
	const [funcRes2, setFuncRes2] = useState("")
	const [funcTrue, setFuncTrue] = useState(false)
	const [mintOn, setMintOn] = useState(true)
	const [appShow, setAppShow] = useState(false)
	const [appShowImg, setAppShowImg] = useState(false)
	
	useEffect(() => {
		Aos.init({ duration: 1500 });
		setTimeout(function() {
			setAppShowImg(true)
		}, 500)
		setTimeout(function() {
			setAppShow(true)
		}, 2000)
	}, []);


	//TIMER FOR MINT COUNTDOWN
	useEffect(() => {
		/*var countDownDate = new Date("Aug 31, 2022 20:00:00").getTime();
		// Update the count down every 1 second
		var x = setInterval(function() {
		// Get today's date and time
		var now = new Date().getTime();	
		// Find the distance between now and the count down date
		var distance = countDownDate - now;	
		// Time calculations for days, hours, minutes and seconds
		var days = Math.floor(distance / (1000 * 60 * 60 * 24));
		var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		var seconds = Math.floor((distance % (1000 * 60)) / 1000);	
		// Output the result in an element with id="demo"
		if(days === 1) {
			days = days + "day : "
		}
		else if(days === 0) {
			days = ""
		}
		else {
			days = days + "days : "
		}
		if(hours === "0") {
			hours = ""
		}
		else {
			hours = hours + "hrs : "
		}
		document.getElementById("launchTime").innerHTML = days + hours + minutes + "mins : " + seconds + "sec";	
		// If the count down is over, write some text 
		if (distance < 0) {
			clearInterval(x);
			document.getElementById("launchTime").innerHTML = "";
			setMintOn(false)
		}
		}, 1000);
		*/
	}, [])







	//CONNECT WALLET
	function walletListener() {
		if (window.ethereum) {
			window.ethereum.on("accountsChanged", (account) => {
			if (account.length > 0) {
				setUserAddress(account[0])
				setIsConnected(true)
			} else {
				setUserAddress(account[0])
				setIsConnected(false)
				alert("install metamask extension!!");
			}
			});
		} else {
			alert("install metamask extension!!");
		}
	}
	useEffect(async () => {
		const account = await window.ethereum.request({method: 'eth_accounts'})
		if (account.length > 0) {
			setUserAddress(account[0])
			setIsConnected(true)
		}
		else {
			setIsConnected(false)
		}
		walletListener()
	}, [])
	const btnhandler = () => {
	// Asking if metamask is already present or not
	if (window.ethereum) {
		// res[0] for fetching a first wallet
		window.ethereum
		.request({ method: "eth_requestAccounts" })
		.then((res) => accountChangeHandler(res[0]));
	} else {
		alert("install metamask extension!!");
	}
	};
	const accountChangeHandler = (account) => {
		setUserAddress(account)
		setIsConnected(true)
	};







	//MINT FUNCTION
	const mintNFT = async(url) => {
		setLoading(true)
		const metadata = new Object();
		metadata.image = url;
	
		//pinata pin request
		const pinataResponse = await pinJSONToIPFS(metadata);
		if (!pinataResponse.success) {
			setLoading(false)
			return {
				success: false,
				status: "😢 Something went wrong while uploading your tokenURI.",
			}
		} 
		const tokenURI = pinataResponse.pinataUrl;
		const convertId = Date.now().toString()
		const amount = ethers.utils.parseUnits("30", 18)
		const nftId = ethers.utils.parseUnits(convertId, 18)
	
		//set up your Ethereum transaction
		const transactionParameters = {
			to: contractAddress,
			from: window.ethereum.selectedAddress,
			data: nftContract.methods.mint(window.ethereum.selectedAddress, nftId, amount).encodeABI()
		};

		const transactionParameters2 = {
			to: contractAddress, // Required except during contract publications.
			from: window.ethereum.selectedAddress, // must match user's active address.
			data: nftContract.methods.setURI(nftId, tokenURI).encodeABI() //make call to NFT smart contract 
		};
		//sign transaction via Metamask
		try {
			const txHash = await window.ethereum
				.request({
					method: 'eth_sendTransaction',
					params: [transactionParameters],
				});
			const txHash2 = await window.ethereum
				.request({
					method: 'eth_sendTransaction',
					params: [transactionParameters2],
				});
			return {
				success: true,
				status: txHash,
				status2: txHash
			}
		} catch (error) {
			return {
				success: false,
				status: "😥 Something went wrong: " + error.message
			}
		}
	}






	//MINT PRESS BUTTON
	const onMintPressed = async () => {
		const res = await mintNFT("https://gateway.pinata.cloud/ipfs/bafybeifxvxx3uegxmddht6s54jlxnp5rnxqbt4szp3r2e6tetpjxcfkici");
		storeRes(res)
	};
	async function storeRes(data) {
		setLoading(false)
		if(data.success) {
			setFuncRes(data.status2)
			setFuncRes2(data.status2)
			setFuncTrue(true)
		}
		else {
			alert(data.status)
			setFuncTrue(false)
		}
	}

	const showCase = [ show1, show2, show3, show4, show5, show6, show7, show8 ]

	const rdMaps = [ "Launch discord, twitter, Instagram and website (achieved)", "Making our collection art and items relatable to both DEFI and NFT investors (achieved)", "Reward the community with whitelisting benefits and special roles within the community ( In progress)", "Collaborate with successful nft projects that have achieved set roadmaps ( In progress )", "Launch the first phase of the collection (2222 RDH NFTs 24th September)" ]

	const rdMaps2 = [ "Restrict discord Community channels to non-holders after reveal by implementing the use of verification bot (collabland)", "Create a free members chat channel for non holders", "Full-time moderation team (in progress)", "Enable our holders to have voting power on major decisions regarding future RDH events via snapshot.", "Hosting web3 educative spaces on twitter twice a week featuring web3 project founders and other guests.", "Rekted Diamond Hands will serve as a home for it's hodlers who would like to become future creators, artists, developers, e.t.c to freely get Informations, collaborations, tools and knowledge regarding whatsoever field of web3 they belong to." ]

	const rdMaps3 = [ "We intend to achieve more unrevealed roadmaps and provide significant utility for our holders from future royalties on market places.", "Royalties from sales will also be used to implement and achieve the highlighted roadmaps above" ]

	const rdhDrive = [ '“YOU and I” are the Rekted Diamond Hands. We’re an organization that prides itself on information and experience. An amalgamation of battle tested veterans in web3 who have incurred significant loses in DEFI & NFTs.', "This project was spurred out of the observation that a large percentage of crypto investors along the line have made reasonable profits from DEFI and NFTs but have made huge losses aswell , also a large percentage of newbies get burnt before learning how to spot red flags 🚩.", "There seem to be a lot of information out there on how to trade NFT’s, how to sell, how to mint, but little awareness on how to preserve liquidity and how to avoid being the exit liquidity of cash grabbing founders and influencers. Holding a token to zero is in no way commendable. It is not loyalty, that is a disservice to hard-earned money.", "We’ve come up with a collection of characters that represent our past experiences as diamond hands to web3 projects, each of these items represent different expressions and can be identified as whales, OGs and kelvins from it’s traits.", "We’re here not only to share our stories from these experiences with our art, but also educate degens and raise a community of intellectual developers, artists,creators etc… sharing this vast wealth of knowledge to new degens, giving them the mental tools to maximize profit.", "We've tried to grow this organically as much as possible, as our utility is not reliant on noise. We are steady builders, with a doxxed team who are going to inevitably change this space."]


	return (
		<ChakraProvider>
			<Flex minHeight="100vh" w="100%" direction="column" bg="linear-gradient(290deg, rgb(20,20,50), rgb(40,40,120))" color="#fff" fontFamily="chalk" px={["4%", "6%"]} pt={["4%", "2.8%"]} pb={["8%", "2.8%"]}>
				{
					!appShow ?
					<Flex w="100%" h="100%" position="fixed" top="0" left="0" zIndex="1000" bg="linear-gradient(290deg, rgb(20,20,50), rgb(40,40,120))" color="#fff" justify="center" align="center" direction="column" pb={["15%", "3%"]}>
						<Flex><Image src={img1} borderRadius="100%" w={["100px", "150px"]} h={["100px", "150px"]}  mb="12" data-aos="fade-right" /><Image src={img2} borderRadius="100%" w={["100px", "150px"]}  h={["100px", "150px"]}  mb="12" data-aos="fade-left" ml="-12" /></Flex>
						
						{
							appShowImg &&
							<Flex fontWeight="bold" fontSize={["25px", "50px"]} overflow="hidden">
								<Text data-aos="fade-left">Rekted</Text>
								<Text data-aos="fade-up" mx={["6", "10"]}>Diamond</Text>
								<Text data-aos="fade-right">Hands</Text>
							</Flex>
						}
					</Flex>
					:
					<>
						<Flex px={["4", "12"]} w="100%" bg="rgba(255,255,255,0.07)" align="center" position="sticky" top="0" borderRadius="8px" mb="6" zIndex="1" data-aos="fade-up" backdropFilter="blur(4px)" py="3">
							<Flex align="center">
								<Image src={icon} w={["40px", "50px"]} h={["40px", "50px"]} />
								<Text fontWeight="bold" ml="3" display={["none", "block"]} textShadow="6px 2px rgb(70,70,70)" fontSize={["20px", "28px"]}>RDH Academy</Text>
							</Flex>
							<Flex flex="1" align="center" justify="flex-end">
								{
									isConnected ?
									<>
										{/*userAddress?.substring(0, 4) + ".." + userAddress?.substring(userAddress?.length - 4, userAddress?.length)*/}
										<Flex ml="3" mr={["3", "7" ]} cursor="pointer" fontWeight="bold" border="1px solid #fff" py="3" borderRadius="8px" px="7" bg="rgba(255,255,255,0.2)" _hover={{ bg: "rgba(255,255,255,0.4)"}} display={["none", "none"]} onClick={onMintPressed}>{loading ? <Spinner color="#fff" emptyColor="lightgrey" /> : "Mint Now"}</Flex>
									</>
									:
									<Flex mr={["3", "7" ]} cursor="pointer" fontWeight="bold" border="1px solid #fff" py="3" borderRadius="8px" px="7" bg="rgba(255,255,255,0.2)" _hover={{ bg: "rgba(255,255,255,0.4)"}} display={["none", "none"]} onClick={btnhandler}>Connect Wallet</Flex>
								}

								<Flex mr={["3", "7" ]} cursor="pointer" fontWeight="bold" border="1px solid #fff" py="3" borderRadius="8px" px="7" bg="rgba(255,255,255,0.2)" _hover={{ bg: "rgba(255,255,255,0.4)"}} display={["none", "flex"]} onClick={() => {
									var a = document.getElementById('rdMap')
									a.scrollIntoView({behavior: "smooth"})
								}}>Roadmap</Flex>

								<Flex fontSize={["18px", "20px"]} h={["40px", "45px"]} w={["40px", "45px"]} align="center" justify="center" borderRadius="100%" bg="rgba(255,255,255,0.9)" transition="300ms ease-in-out" _hover={{ bg: "rgba(255,255,255,0.7)"}} cursor="pointer"  mr={["3", "5" ]} onClick={() => window.open("https://twitter.com/RDHNFTs", "_BLANK")} color="#1DA1F2"><i className="mdi mdi-twitter"></i></Flex>


								<Flex fontSize={["18px", "20px"]} h={["40px", "45px"]} w={["40px", "45px"]}  align="center" justify="center" borderRadius="100%" bg="rgba(255,255,255,0.9)" transition="300ms ease-in-out" _hover={{ bg: "rgba(255,255,255,0.7)"}} cursor="pointer"  color="#cd486b" mr={["3", "5" ]} onClick={() => window.open("https://www.instagram.com/rdhnfts/", "_BLANK")}><i className="mdi mdi-instagram"></i></Flex>

								<Flex fontSize={["18px", "20px"]} h={["40px", "45px"]} w={["40px", "45px"]}  align="center" justify="center" borderRadius="100%" bg="rgba(255,255,255,0.9)" transition="300ms ease-in-out" _hover={{ bg: "rgba(255,255,255,0.7)"}} cursor="pointer" color="#7289da" onClick={() => window.open("https://discord.gg/rdhnft", "_BLANK")}><i className="mdi mdi-discord"></i></Flex>
							</Flex>
						</Flex>
								
						{
							/*
							<Flex direction="column" py="4" data-aos="fade-down" px="5">
								<Text w="100%" fontSize={["20px", "40px"]} fontWeight="bold" textAlign="center" mb="2" mt="5">Minting In 🚀</Text>
								<Text w="100%" fontSize={["30px", "50px"]} fontWeight="bold" id="launchTime" textAlign="center"></Text>
							</Flex>
							*/
						}

						<Flex w="100%" justify="space-between" mt={["6", "12"]} overflowX="hidden"  className="bgStars" direction={["column", "row"]}>
							{
								isConnected ?
								<>
									<Text display={["none", "none"]}>{userAddress?.substring(0, 4) + ".." + userAddress?.substring(userAddress?.length - 4, userAddress?.length)}</Text>
									<Flex ml="3" mb="6" cursor="pointer" fontWeight="bold" border="1px solid #fff" py="3" borderRadius="8px" px="7" bg="rgba(255,255,255,0.2)" _hover={{ bg: "rgba(255,255,255,0.4)"}} display={["none", "none"]} onClick={onMintPressed}>Mint Now</Flex>
								</>
								:
								<Flex mb="6" cursor="pointer" fontWeight="bold" border="1px solid #fff" py="3" borderRadius="8px" px="7" bg="rgba(255,255,255,0.2)" _hover={{ bg: "rgba(255,255,255,0.4)"}} display={["none", "none"]} onClick={btnhandler}>Connect Wallet</Flex>
							}
							<Flex w="100%" display={["flex", "none"]} mb="6" justify="space-between" align="center" data-aos="fade-left" className="bgStars2">
								<Image w="48%" src={img1} borderRadius="8px" className="mshake" />
								<Image w="48%" src={img2} borderRadius="8px" className="mshake2" />
							</Flex>

							<Flex w={["100%", "45%"]} direction="column" mt="6">
								{
									funcTrue &&
									<Text data-aos="fade-up" mb="5" mt="2" border="1px solid #019401" py="3" borderRadius="8px" px="7" bg="rgba(14, 232, 14, .2)">Minted!! Check out your transaction on <Text textDecoration="underline" fontWeight="bold" cursor="pointer" onClick={() => window.open("https://goerli.etherscan.io/tx/" + funcRes, "_BLANK")}>https://goerli.etherscan.io/tx/{funcRes}</Text></Text>
								}
								<Flex w="100%" direction="column" data-aos="fade-right" borderRadius="8px" py="6">
									<Flex align="center" mb="3" color="rgb(255, 0, 98)" fontSize="30px"><Text mb="15px">_</Text><Flex h="72px" w="72px" align="center" justify="center" borderRadius="100%" bg="rgb(80,80,130)" transition="300ms ease-in-out" _hover={{ bg: "rgb(100,100,150)"}} data-aos="fade-up" border="2px solid rgb(255, 0, 98)"><i className="mdi mdi-earth"></i></Flex></Flex>

									<Text color="rgb(200,200,250)" fontSize="20px">WHAT IS RDH?</Text>
									<Text fontWeight="bold" fontSize={["28px", "30px"]}>Rekted diamond hands (RDH)</Text>

									<Text fontSize={["16px", "17px"]} borderRadius="8px" px={["6", "8"]} py="3">
										Is a collection for the community and by the community, 5555 ERC-721 tokens randomly generated on the ethereum blockchain. We aim to be a source of light for rekt hodlers in the dark tunnel of the bear season, FOMO in to get your rekted bags pumped. 
									</Text>
								</Flex>
							</Flex>
							
							<Flex w="55%" display={["none", "flex"]} justify="space-between" align="center" data-aos="fade-left" pb="15%" pl="5%">
								<Image w="50%" src={img1} borderRadius="15px" className="shake" />
								<Image w="45%" src={img2} borderRadius="15px" className="shake2" />
							</Flex>
						</Flex>
								
						<Text id="rdMap" visibility="hidden"></Text>
						<Flex w="100%" overflow="hidden" mt={["4", "0"]}>
							<Flex w={["90%", "70%"]} direction="column" data-aos="fade-right" bg="rgba(255,255,255,0.05)" borderRadius="8px" px={["6", "8"]} py="6">
								<Text fontSize={["15px", "17px"]}>
									<Flex align="center" mb="3" color="rgb(255, 213, 0)" fontSize="25px"><Flex h="60px" w="60px" align="center" justify="center" borderRadius="100%" bg="rgb(80,80,130)" transition="300ms ease-in-out" _hover={{ bg: "rgb(100,100,150)"}} data-aos="fade-up" border="2px solid rgb(255, 213, 0)"><i className="mdi mdi-rocket"></i></Flex><Text mb="10px">_</Text></Flex>

									<Text color="rgb(200,200,250)" mb="1" fontSize="20px">RDH Roadmap</Text>
									<Text fontWeight="bold" fontSize={["20px", "30px" ]} mb="2">- Launching the collection</Text>
									<Flex direction="column" ml={["1", "12"]} w="100%" data-aos="fade-up">
										{
											rdMaps.map((item, index) => (
												<Flex key={index} w="100%" mb="4" justify="space-between" pr={["0", "10%"]}>
													<Text w={["35px", "60px"]} fontWeight="bold" fontSize={["18px", "40px" ]}color="rgb(200,200,250)">0{index + 1}.</Text>
													<Text w="90%" mt={["0", "3"]}>{item}</Text>
												</Flex>
											))
										}
									</Flex>
								</Text>
							</Flex>
							<Flex w={["10%", "30%"]} mt="100px" borderTop={["8px solid rgba(255,255,255,0.05)", "15px solid rgba(255,255,255,0.05)"]} borderRight={["8px solid rgba(255,255,255,0.05)", "15px solid rgba(255,255,255,0.05)"]} borderTopRightRadius="15px"></Flex>
						</Flex>


						<Flex w="100%" mt={["6", "12"]} overflow="hidden">	
							<Flex w={["10%", "30%"]} mt="100px" borderTop={["8px solid rgba(255,255,255,0.05)", "15px solid rgba(255,255,255,0.05)"]} borderLeft={["8px solid rgba(255,255,255,0.05)", "15px solid rgba(255,255,255,0.05)"]} borderTopLeftRadius="15px"></Flex>
							<Flex w={["90%", "70%"]} direction="column" data-aos="fade-left" bg="rgba(255,255,255,0.05)" borderRadius="8px" px={["6", "8"]} py="6">
								<Text fontSize={["15px", "17px"]}>
									<Flex align="center" mb="3" color="rgb(255, 213, 0)" fontSize="25px"><Flex h="60px" w="60px" align="center" justify="center" borderRadius="100%" bg="rgb(80,80,130)" transition="300ms ease-in-out" _hover={{ bg: "rgb(100,100,150)"}} data-aos="fade-up" border="2px solid rgb(255, 213, 0)"><i className="mdi mdi-google-circles-extended"></i></Flex><Text mb="10px">_</Text></Flex>

									<Text color="rgb(200,200,250)" mb="1" fontSize="20px">RDH Roadmap</Text>
									<Text fontWeight="bold" fontSize={["20px", "30px" ]} mb="2">- Community &amp; Connection</Text>
									<Flex direction="column" ml={["1", "12"]} w="100%" data-aos="fade-up">
										{
											rdMaps2.map((item, index) => (
												<Flex key={index} w="100%" mb="4" justify="space-between" pr={["0", "10%"]}>
													<Text w={["35px", "60px"]} fontWeight="bold" fontSize={["18px", "40px" ]}color="rgb(200,200,250)">0{index + 1}.</Text>
													<Text w="90%" mt={["0", "3"]}>{item}</Text>
												</Flex>
											))
										}
									</Flex>
								</Text>
							</Flex>
						</Flex>

						<Flex w="100%" overflow="hidden" mt={["6", "12"]}>
							<Flex w={["90%", "70%"]} direction="column" data-aos="fade-right" bg="rgba(255,255,255,0.05)" borderRadius="8px" px={["6", "8"]} py="6">
								<Text fontSize={["15px", "17px"]}>
									<Flex align="center" mb="3" color="rgb(255, 213, 0)" fontSize="25px"><Flex h="60px" w="60px" align="center" justify="center" borderRadius="100%" bg="rgb(80,80,130)" transition="300ms ease-in-out" _hover={{ bg: "rgb(100,100,150)"}} data-aos="fade-up" border="2px solid rgb(255, 213, 0)"><i className="mdi mdi-crown"></i></Flex><Text mb="10px">_</Text></Flex>

									<Text color="rgb(200,200,250)" mb="1" fontSize="20px">RDH Roadmap</Text>
									<Text fontWeight="bold" fontSize={["20px", "30px" ]} mb="2">- Royalties</Text>
									<Flex direction="column" ml={["1", "12"]} w="100%" data-aos="fade-up">
										{
											rdMaps3.map((item, index) => (
												<Flex key={index} w="100%" mb="4" justify="space-between" pr={["0", "10%"]}>
													<Text w={["35px", "60px"]} fontWeight="bold" fontSize={["18px", "40px" ]}color="rgb(200,200,250)">0{index + 1}.</Text>
													<Text w="90%" mt={["0", "3"]}>{item}</Text>
												</Flex>
											))
										}
									</Flex>
								</Text>
							</Flex>
							<Flex w={["10%", "30%"]} mt="100px" borderTop={["8px solid rgba(255,255,255,0.05)", "15px solid rgba(255,255,255,0.05)"]} borderRight={["8px solid rgba(255,255,255,0.05)", "15px solid rgba(255,255,255,0.05)"]} borderTopRightRadius="15px"></Flex>
						</Flex>

						<Flex mt={["6", "12"]} mb="6" bg="rgba(255,255,255,0.03)" w={["100vw", "100%"]} py={["6", "12"]} borderRadius={["0px", "8px"]} data-aos="fade-up" className="absW" px={["5%", "15%"]} direction="column" align="center">
							<Flex w="100%" direction="column" display={["none", "flex"]} align="flex-start">
								<Text mb="2" fontSize={["20px", "25px"]} fontWeight="bold" data-aos="fade-right">RDH Sneak Peeks</Text>
								<Text mb="12" textAlign="left" px={["2", "0%"]} pr={["0", "20%"]} data-aos="fade-left">
									All items in this collection will represent the experience a holder encountered in his/her Cypto/NFT journey.<br/>
									Represent your journey!
								</Text>
							</Flex>
							<Flex align="center" w="100%" justify="center">
								<Carousel
									autoPlay={true}
									infiniteLoop={true}
									showStatus={false}
									showIndicators={true}
									swipeable={true}
									showArrows={true}
									showThumbs={false}
									stopOnHover={false}
									interval={4000}
								>
									{
										showCase.map((item, index) => (
											<Flex w="100%" px={["1%", "25%"]} key={index} align="center" direction="column">
												<Image src={item} key={index} borderRadius="8px" className="carImg shake" />
											</Flex>
										))
									}
								</Carousel>
							</Flex>
							<Flex w="100%" direction="column" display={["flex", "none"]} align="center" overflowX="hidden">
								<Text mt="12" mb="2" fontSize={["20px", "25px"]} fontWeight="bold" data-aos="fade-right">RDH Sneak Peeks</Text>
								<Text textAlign="center" px={["2", "20%"]} data-aos="fade-left">
									All items in this collection will represent the experience a holder encountered in his/her Cypto/NFT journey.<br/>
									Represent your journey!
								</Text>
							</Flex>
						</Flex>

						<Flex w="100%" mt={["6", "12"]} data-aos="fade-up" bg="rgba(255,255,255,0.05)" borderRadius="8px" px={["6", "8"]} py="6" direction="column">
							<Flex pr={["0", "5%" ]}align="flex-start" direction={["column", "row"]}>
								<Flex mr="6" mt={["2", "6"]} align="center" mb="3" color="rgb(0, 255, 234)" fontSize="50px"><Text mb="25px">_</Text><Flex h="100px" w="100px" align="center" justify="center" borderRadius="100%" bg="rgb(80,80,130)" transition="300ms ease-in-out" _hover={{ bg: "rgb(100,100,150)"}} data-aos="fade-up" border="2px solid rgb(0, 255, 234)"><i className="mdi mdi-rocket"></i></Flex></Flex>
								<Text>
									<Text fontWeight="bold" fontSize="30px">OUR <Text display={["inline-block", "block"]}>DRIVE</Text></Text>
									<Text mb="4" fontWeight="bold">What is Rekted Diamond Hands and what are we really about?</Text>
									<Text mt="4">
										{
											rdhDrive.map((item, index) => (
												<Flex key={index} w="100%" mb="3" data-aos="fade-up"><Text fontWeight="bold" mr="3">_</Text><Text>{item}</Text></Flex>
											))
										}
									</Text>
								</Text>
							</Flex>
						</Flex>

						<Flex w="100%" mt={["6", "12"]} data-aos="fade-up" bg="rgba(255,255,255,0.05)" borderRadius="8px" px={["6", "8"]} py="6" direction="column" align="center">
							<Flex align="flex-start" direction={["column", "row"]}>
								<Flex mr="6" mt={["2", "1"]} align="center" mb="3" color="rgb(255, 42, 0)" fontSize="50px"><Text mb="25px">_</Text><Flex h="100px" w="100px" align="center" justify="center" borderRadius="100%" bg="rgb(80,80,130)" transition="300ms ease-in-out" _hover={{ bg: "rgb(100,100,150)"}} data-aos="fade-up" border="2px solid rgb(255, 42, 0)"><i className="mdi mdi-eye"></i></Flex></Flex>
								<Text>
									<Text fontWeight="bold" fontSize="30px">OUR <Text display={["inline-block", "block"]}>VISION</Text></Text>
									<Text mb="4" fontWeight="bold">We are guided by a simple vision which is onboarding and empowering upcoming degens in web3.</Text>
								</Text>
							</Flex>
						</Flex>

						<Flex justify="center" mt={["6", "12"]} backgroundColor="rgba(255,255,255,0.03)" borderRadius="8px" py="12" className="bgStars">
							<Flex w="100%" direction="column" align="center">
								<Text fontWeight="bold" fontSize={["24px", "30px"]}>
									The RDH Founders
								</Text>
								<Flex w="100%" align="center" justify="center" px="10%" direction={["column", "row"]}>
									<Flex direction="column" align="center" w={["100%", "50%"]} mb={["5", "0"]}>
										<Image w={["170px", "200px"]} h={["170px", "200px"]} borderRadius="100%" src={founder1} mt="6" data-aos="fade-up" />
										<Text textAlign="center" px={["2%", "10%"]} mt="6" data-aos="fade-up">
										<Text color="rgb(200,200,250)" cursor="pointer" mb="2" onClick={() => window.open("https://twitter.com/solsmahneth?s=21&t=_O59LWK2c3h6KY31ZgkOxw", "_BLANK")}>@Solsmahneth</Text>
										Also known as Tulipman in the community, Solsmahn is a UAE based Blockchain developer and NFT consultant
										</Text>
									</Flex>

									<Flex direction="column" align="center" w={["100%", "50%"]} mb={["5", "0"]}>
										<Image w={["170px", "200px"]} h={["170px", "200px"]} borderRadius="100%" src={founder2} mt="6" data-aos="fade-up" />
										<Text textAlign="center" px={["2%", "10%"]} mt="6" data-aos="fade-up">
										<Text color="rgb(200,200,250)" cursor="pointer" mb="2" onClick={() => window.open("https://twitter.com/mastrodre", "_BLANK")}>@Mastrodre</Text>
										Also known as OG kelvin is a Dubai based web 3 enthusiast and investor.
										</Text>
									</Flex>
								</Flex>

								<Flex align="center" w="100%" px="10%" direction={["column", "row"]} justify="center">

									<Flex w={["100%", "50%"]} direction="column" align="center">
										<Text fontWeight="bold" fontSize={["24px", "30px"]} mt={["12", "100px"]} mb="2" data-aos="fade-up">
											Developer
										</Text>

										<Flex w="100%" align="center" justify="center" px="0%" direction={["column", "row"]}>
											<Flex direction="column" align="center" w={["100%", "50%"]}>
												<Image w={["170px", "200px"]} h={["170px", "200px"]} borderRadius="100%" src={founder4} mt="6" data-aos="fade-up" />

												<Text textAlign="center" px={["2%", "10%"]} mt="6" data-aos="fade-up">
												<Text color="rgb(200,200,250)" cursor="pointer" mb="2" onClick={() => window.open("https://twitter.com/thelunalabs?s=11&t=26eD2Z6tX4ktKWIeAkj7kg", "_BLANK")}>@TheLunaLabs</Text>
												</Text>
											</Flex>
										</Flex>
									</Flex>
								</Flex>
							</Flex>
						</Flex>
						
						<Flex direction="column" mt={["6", "12"]} bgColor="rgba(255,255,255,0.03)" borderRadius="8px" py="12" px={["6", "0"]}>
							<Text textAlign="center"  data-aos="fade-up">Created by the RDH founders with special love to our community, Our friends, families, and loved ones</Text>
							
							<Text textAlign="center" mt="3"  data-aos="fade-up">For partnership inquiries, please contact <Text as="span" color="rgb(200,200,250)" mb="2" cursor="pointer" onClick={() => window.open("mailto: partnership@rdh.club")}>partnership@rdh.club</Text></Text>

							
							<Text textAlign="center" mt="3"  data-aos="fade-up">For all press inquiries, please contact <Text as="span" color="rgb(200,200,250)" mb="2" cursor="pointer" onClick={() => window.open("mailto: press@rdh.club")}>press@rdh.club</Text></Text>
							
							<Flex flex="1" align="center" justify="center" mt="8"  data-aos="fade-up">
							<Flex fontSize={["18px", "20px"]} h={["40px", "45px"]} w={["40px", "45px"]} align="center" justify="center" borderRadius="100%" bg="rgba(255,255,255,0.1)" transition="300ms ease-in-out" _hover={{ bg: "rgba(255,255,255,0.3)"}} cursor="pointer" className="bounce" mr={["3", "5" ]} onClick={() => window.open("https://twitter.com/RDHNFTs", "_BLANK")}><i className="mdi mdi-twitter"></i></Flex>

							<Flex fontSize={["18px", "20px"]} h={["40px", "45px"]} w={["40px", "45px"]}  align="center" justify="center" borderRadius="100%" bg="rgba(255,255,255,0.1)" transition="300ms ease-in-out" _hover={{ bg: "rgba(255,255,255,0.3)"}} className="bounce" mr={["3", "5" ]} cursor="pointer" onClick={() => window.open("https://discord.gg/rdhnft", "_BLANK")}><i className="mdi mdi-discord"></i></Flex>

							<Flex fontSize={["18px", "20px"]} h={["40px", "45px"]} w={["40px", "45px"]}  align="center" justify="center" borderRadius="100%" bg="rgba(255,255,255,0.1)" transition="300ms ease-in-out" _hover={{ bg: "rgba(255,255,255,0.3)"}} className="bounce2" onClick={() => window.open("https://www.instagram.com/rdhnfts/", "_BLANK")} cursor="pointer"><i className="mdi mdi-instagram"></i></Flex>
							</Flex>
						</Flex>
					</>
				}
			</Flex>
		</ChakraProvider>
	)
}

export default App;
