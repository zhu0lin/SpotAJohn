import SpotaJohnIcon from "../assets/icon.png"
import "../styles/Footer.css"

export default function Footer() {

    const currentYear = new Date().getFullYear();

    return (
        <>
        <footer className="footer">
                <div className="footerLine"></div>
                <div className="footerTop">
                    <div className="footerLogo">
                        <img src={SpotaJohnIcon} alt="Spot a John icon" />
                        <span>Spot a John</span>
                    </div>
                    <div className="footerSubtitle">Spot a John is in alpha. Expect bugs and issues.</div>
                </div>
                <div className="footerBottom">
                    <div className="footerCopyright">Copyright © {currentYear} Spot a John. All rights reserved.</div>
                    <div className="footerLocation">Made with passion in Brooklyn, NY</div>
                </div>
            </footer>
        </>
    )
}