import { useNavigate } from 'react-router-dom';
import SpotaJohnIcon from "../assets/icon.png";
import startFrame from "../assets/start_frame.png";
import Footer from "../components/Footer";
import '../styles/Home.css';


const whyUsFeatures = [
    {
        icon: (
            <svg width="48" height="48" fill="none" stroke="#212529" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 12l3 3 5-5" /></svg>
        ),
        title: "Verified Cleanliness",
        desc: "Crowd-sourced ratings and photos, so you know it’s spotless before you go."
    },
    {
        icon: (
            <svg width="48" height="48" fill="none" stroke="#212529" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
        ),
        title: "Real-Time Availability",
        desc: "Live hours and “occupied / open” status keep you from wasting time on locked doors."
    },
    {
        icon: (
            <svg width="48" height="48" fill="none" stroke="#212529" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" /><path d="M12 7v4m0 0l-3 9m3-9l3 9m-3-9h4.5a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2H12z" /></svg>
        ),
        title: "Accessibility First",
        desc: "Filter for wheelchair access, baby-changing tables, & gender-neutral stalls."
    },
    {
        icon: (
            <svg width="48" height="48" fill="none" stroke="#212529" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="15" cy="15" r="4" /><path d="M21 21l-4.35-4.35" /><path d="M7 7l4 4" /><path d="M3 3l4 4" /></svg>
        ),
        title: "Insider Tips & Codes",
        desc: "Users share passcodes, purchase requirements, and secret hallway directions."
    }
];

const howItWorksSteps = [
    {
        number: 1,
        title: "Search the map or find by accessibility categories",
        desc: "Moving around in the map offers a general overview of locations. Sorting by more categories allows for specific look ups."
    },
    {
        number: 2,
        title: "Individual restroom details",
        desc: "Clicking on a restroom will show in depth details, so that you know everything before you even step foot into the location."
    },
    {
        number: 3,
        title: "Give back to others",
        desc: "Make an account, post about locations, discuss concerns, and embrace community with Spot a John."
    }
];

function WhyUsCard({ icon, title, desc }) {
    return (
        <div className="whyUsCard">
            <div className="whyUsIcon">{icon}</div>
            <div className="whyUsCardTitle">{title}</div>
            <div className="whyUsCardDesc">{desc}</div>
        </div>
    );
}


export default function Home() {
    const navigate = useNavigate();
    return (
        <>
            <div className="startFrame">
                <div className="leftSection">
                    <div className="logo">
                        <h3>
                            <img src={SpotaJohnIcon} alt="Spot a John icon" />
                            Spot a John
                        </h3>
                    </div>
                    <div className="startFrameMainContent">
                        <div className="callToAction">
                            <h1>Gotta Go? Know Where to Go</h1>
                            <h2>Because finding a clean restroom shouldn't feel like a scavenger hunt.</h2>
                            <div className="ctaButtons">
                                <button className="getStartedBtn" onClick={() => navigate('/signup')}>Get Started</button>
                                <button className="loginBtn" onClick={() => navigate('/login')}>Login</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rightSection">
                    <div className="illustration">
                        <img src={startFrame} alt="App illustration" />
                    </div>
                </div>
            </div>
            <section className="whyUsSection">
                <h2 className="whyUsTitle">Why Choose Spot a John?</h2>
                <p className="whyUsSubtitle">Our app finds clean, accessible, user-verified restrooms in crowded cities</p>
                <div className="whyUsGrid">
                    {whyUsFeatures.map((feature, idx) => (
                        <WhyUsCard key={idx} icon={feature.icon} title={feature.title} desc={feature.desc} />
                    ))}
                </div>
            </section>
            <section className="howItWorksSection">
                <h2 className="howItWorksTitle">How it works</h2>
                <p className="howItWorksSubtitle">Find what you need quick, without stress</p>
                <div className="howItWorksSteps">
                    {howItWorksSteps.map((step, idx) => (
                        <div className="howItWorksStep" key={idx}>
                            <div className="howItWorksNumber">{step.number}</div>
                            <div className="howItWorksStepContent">
                                <div className="howItWorksStepTitle">{step.title}</div>
                                <div className="howItWorksStepDesc">{step.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <Footer />
        </>
    )
}