import TopBar from "../components/TopBar/TopBar";
import { useContext, useEffect, useRef, useState } from "react";
import { FaRegCheckCircle, FaRegCopy, FaRegTimesCircle } from "react-icons/fa";
import { AppContext } from "../App";
import _1ChooseYourPackage from "../components/RaydiumTokenLaunch/_1ChooseYourPackage";
import _2CreateSPLToken from "../components/RaydiumTokenLaunch/_2CreateSPLToken";
import _3SetAuthority from "../components/RaydiumTokenLaunch/_3SetAuthority";
import _4OpenBookMarket from "../components/RaydiumTokenLaunch/_4OpenBookMarket";
import { ellipsisAddress } from "../utils/methods";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import FairLaunch from "../components/FairLaunch/FairLaunch";

const FairLaunchPage = () => {
    const { currentProject } = useContext(AppContext);
    const [selectedProject, setSelectedProject] = useState((currentProject.platform != 'raydium-fair' || currentProject.paymentId == 0) ? { name: "New Project" } : { ...currentProject });
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [confirmedStep, setConfirmedStep] = useState(0);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const dialogRef = useRef()

    useEffect(() => {
        if (step == 0)
            setSelectedProject((currentProject.platform != 'raydium-fair' || currentProject.paymentId == 0) ? { name: "New Project" } : { ...currentProject });
        // setStep(0);
    }, [currentProject])

    useEffect(() => {
        if (step > confirmedStep) setConfirmedStep(step);
    }, [step])

    const copyToClipboard = async (key, text) => {
        if ('clipboard' in navigator) {
            await navigator.clipboard.writeText(text);
            toast.success("Copied");
            setCopied({
                ...copied,
                [key]: true,
            });
            setTimeout(() => setCopied({
                ...copied,
                [key]: false,
            }), 2000);
        }
        else
            console.error('Clipboard not supported');
    };

    return (
        <div className="w-screen h-screen flex flex-col items-center overflow-auto">
            <TopBar noProject={true} />
            <div className="w-full h-[30%] grow flex flex-col gap-2 items-center">
                Raydium Fair Token Launch
                <div className="w-full h-[30%] grow px-10 pb-10 flex gap-12">
                    <ol class="relative min-w-[200px] h-full flex flex-col justify-between text-gray-500 border-e-2 border-gray-normal dark:border-gray-700 dark:text-gray-400">
                        <li class="me-6 cursor-pointer hover:bg-gray-weight" onClick={() => { confirmedStep >= 0 && setStep(0) }}>
                            <span class={`absolute flex items-center justify-center w-8 h-8 ${confirmedStep > 0 ? "bg-green-normal" : "bg-black-dark"} rounded-full -end-4 ring-4 ring-gray-500 dark:ring-gray-900 dark:bg-green-900`}>
                                {
                                    confirmedStep > 0 ? <svg class="w-3.5 h-3.5 text-green-500 dark:text-green-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                                        <path stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
                                    </svg> :
                                        <p className="font-bold text-sm">1</p>
                                }
                            </span>
                            <h3 class={`font-medium leading-tight text-sm ${confirmedStep == 0 ? "text-white" : "text-green-normal"} ${step == 0 && "brightness-125"}`}>Choose Package</h3>
                            <p class="text-sm">{selectedProject && selectedProject.paymentId && `Package ${selectedProject.paymentId}`}</p>
                        </li>
                        <li class="me-6 cursor-pointer hover:bg-gray-weight" onClick={() => { confirmedStep >= 1 && setStep(1) }}>
                            <span class={`absolute flex items-center justify-center w-8 h-8 ${confirmedStep > 1 ? "bg-green-normal" : "bg-black-dark"} rounded-full -end-4 ring-4 ring-gray-500 dark:ring-gray-900 dark:bg-green-900`}>
                                {
                                    confirmedStep > 1 ? <svg class="w-3.5 h-3.5 text-green-500 dark:text-green-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                                        <path stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
                                    </svg> :
                                        <p className="font-bold text-sm">2</p>
                                }
                            </span>
                            <h3 class={`font-medium leading-tight text-sm ${confirmedStep == 1 ? "text-white" : confirmedStep > 1 && "text-green-normal"} ${step == 1 && "brightness-125"}`}>Create Token</h3>
                            {
                                selectedProject && selectedProject.token?.address &&
                                <p class="flex gap-2 justify-center items-center text-sm">
                                    {ellipsisAddress(selectedProject.token.address)}
                                    {
                                        (copied["address"] ?
                                            (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>) :
                                            (<FaRegCopy className="w-3.5 h-3.5 transition ease-in-out transform cursor-pointer active:scale-95 duration-100 text-gray-normal" onClick={() => copyToClipboard("address", selectedProject.token.address)} />))
                                    }
                                </p>
                            }
                        </li>
                        <li class="me-6 cursor-pointer hover:bg-gray-weight" onClick={() => { confirmedStep >= 2 && setStep(2) }}>
                            <span class={`absolute flex items-center justify-center w-8 h-8 ${confirmedStep > 2 ? "bg-green-normal" : "bg-black-dark"} rounded-full -end-4 ring-4 ring-gray-500 dark:ring-gray-900 dark:bg-green-900`}>
                                {
                                    confirmedStep > 2 ? <svg class="w-3.5 h-3.5 text-green-500 dark:text-green-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                                        <path stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
                                    </svg> :
                                        <p className="font-bold text-sm">3</p>
                                }
                            </span>
                            <h3 class={`font-medium leading-tight text-sm ${confirmedStep == 2 ? "text-white" : confirmedStep > 2 && "text-green-normal"} ${step == 2 && "brightness-125"}`}>Set Authority</h3>
                            <div className="flex flex-col items-center">
                                {
                                    confirmedStep >= 2 && selectedProject?.token?.address && <div className={"w-[100px] flex items-center justify-between gap-1"}>
                                        Mintable
                                        {selectedProject.token.mintAuthorityRevoked ? <div className="flex gap-1 items-center text-green-normal"><FaRegCheckCircle /> No</div> : <div className="flex gap-1 items-center text-red-normal"><FaRegTimesCircle /> Yes</div>}
                                    </div>
                                }
                                {
                                    confirmedStep >= 2 && selectedProject?.token?.address && <div className={"w-[100px] flex items-center justify-between gap-1"}>
                                        Freezable
                                        {selectedProject.token.freezeAuthorityRevoked ? <div className="flex gap-1 items-center text-green-normal"><FaRegCheckCircle /> No</div> : <div className="flex gap-1 items-center text-red-normal"><FaRegTimesCircle /> Yes</div>}
                                    </div>
                                }
                            </div>
                        </li>
                        <li class="me-6 cursor-pointer hover:bg-gray-weight" onClick={() => { confirmedStep >= 3 && setStep(3) }}>
                            <span class={`absolute flex items-center justify-center w-8 h-8 ${confirmedStep > 3 ? "bg-green-normal" : "bg-black-dark"} rounded-full -end-4 ring-4 ring-gray-500 dark:ring-gray-900 dark:bg-green-900`}>
                                {
                                    confirmedStep > 3 ? <svg class="w-3.5 h-3.5 text-green-500 dark:text-green-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                                        <path stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
                                    </svg> :
                                        <p className="font-bold text-sm">4</p>
                                }
                            </span>
                            <h3 class={`font-medium leading-tight text-sm ${confirmedStep == 3 ? "text-white" : confirmedStep > 3 && "text-green-normal"} ${step == 3 && "brightness-125"}`}>OpenBook Market</h3>
                            {
                                selectedProject && selectedProject.token?.marketId && selectedProject.token?.marketId !== "" &&
                                <p class="flex gap-2 justify-center items-center text-sm">
                                    {ellipsisAddress(selectedProject.token.marketId)}
                                    {
                                        (copied["address"] ?
                                            (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>) :
                                            (<FaRegCopy className="w-3.5 h-3.5 transition ease-in-out transform cursor-pointer active:scale-95 duration-100 text-gray-normal" onClick={() => copyToClipboard("address", selectedProject.token.marketId)} />))
                                    }
                                </p>
                            }
                        </li>
                        <li class="me-6 cursor-pointer hover:bg-gray-weight" onClick={() => { confirmedStep >= 4 && setStep(4) }}>
                            <span class={`absolute flex items-center justify-center w-8 h-8 ${confirmedStep > 4 ? "bg-green-normal" : "bg-black-dark"} rounded-full -end-4 ring-4 ring-gray-500 dark:ring-gray-900 dark:bg-green-900`}>
                                {
                                    confirmedStep > 4 ? <svg class="w-3.5 h-3.5 text-green-500 dark:text-green-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                                        <path stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
                                    </svg> :
                                        <p className="font-bold text-sm">5</p>
                                }
                            </span>
                            <h3 class={`font-medium leading-tight text-sm ${confirmedStep == 4 ? "text-white" : confirmedStep > 4 && "text-green-normal"} ${step == 4 && "brightness-125"}`}>Bundle</h3>
                        </li>
                    </ol>
                    <div className="w-full h-full flex flex-col gap-2">
                        {
                            step == 0 && <div className="wizard-div overflow-auto p-6 flex flex-col items-center justify-center">
                                <_1ChooseYourPackage
                                    selectedProject={selectedProject}
                                    setSelectedProject={setSelectedProject}
                                    setStep={setStep}
                                    type='raydium-fair'
                                />
                            </div>
                        }
                        {
                            step == 1 && <div className="wizard-div overflow-auto p-6 flex flex-col items-center justify-center">
                                <_2CreateSPLToken
                                    type="raydium-fair"
                                    selectedProject={selectedProject}
                                    setSelectedProject={setSelectedProject}
                                    setStep={setStep}
                                />
                            </div>
                        }
                        {
                            step == 2 && <div className="wizard-div overflow-auto p-6 flex flex-col items-center justify-center">
                                <_3SetAuthority
                                    selectedProject={selectedProject}
                                    setStep={setStep}
                                    type="raydium-fair"
                                />
                            </div>
                        }
                        {
                            step == 3 && <div className="wizard-div overflow-auto p-6 flex flex-col items-center justify-center">
                                <_4OpenBookMarket
                                    selectedProject={selectedProject}
                                    setStep={setStep}
                                />
                            </div>
                        }
                        {
                            step == 4 && <div className="wizard-div overflow-auto p-6 flex flex-col items-center justify-center">
                                <FairLaunch className={"w-full h-full"} />
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div id="dialog-root" ref={dialogRef}></div>
        </div>
    );
};

export default FairLaunchPage;
