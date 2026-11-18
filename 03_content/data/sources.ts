import type { Source } from './types';

// Identyfikatory N/S/P/A/R/W pochodzą z KM1-Baza-Zrodel.md (linki zweryfikowane 08.11.2026).
// Prefiks X: źródła dodane w sesji 2 po sprawdzeniu, że URL/DOI odpowiada (18.11.2026).

export const sources: Source[] = [
  // Normy i regulacje
  { id: 'N1', short: 'NIST SP 800-63B-4', full: 'NIST SP 800-63B-4, Digital Identity Guidelines: Authentication and Authenticator Management', url: 'https://pages.nist.gov/800-63-4/sp800-63b.html', year: 2025, type: 'norma' },
  { id: 'N2', short: 'NIST SP 800-63-4', full: 'NIST SP 800-63-4 (pakiet -63, -63A, -63B, -63C)', url: 'https://csrc.nist.gov/pubs/sp/800/63/4/final', year: 2025, type: 'norma' },
  { id: 'N3', short: 'PSD2 + RTS SCA', full: 'Dyrektywa (UE) 2015/2366 (PSD2) oraz Rozporządzenie delegowane (UE) 2018/389 (RTS SCA)', url: 'https://eur-lex.europa.eu/eli/reg_del/2018/389/oj', year: 2018, type: 'norma' },
  { id: 'N4', short: 'OWASP MFA / Authentication', full: 'OWASP Multifactor Authentication Cheat Sheet oraz Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html', year: 2024, type: 'norma' },
  { id: 'N5', short: 'OWASP Top 10 A07', full: 'OWASP Top 10 (2021), A07: Identification and Authentication Failures', url: 'https://cheatsheetseries.owasp.org/IndexTopTen.html', year: 2021, type: 'norma' },
  { id: 'N6', short: 'ISO/IEC 27001, 29115, 30107', full: 'ISO/IEC 27001/27002, ISO/IEC 29115, ISO/IEC 30107-1/-3 (Presentation Attack Detection)', url: 'https://www.iso.org/standard/27001', year: 2022, type: 'norma' },
  { id: 'N7', short: 'ENISA eIDAS w e-finansach', full: 'ENISA, On the security and privacy of eID and authentication in e-finance/e-payments', url: 'https://www.enisa.europa.eu/sites/default/files/publications/eIDAS4eFinance_ePay.pdf', year: 2013, type: 'raport' },
  // Specyfikacje
  { id: 'S1', short: 'W3C WebAuthn L3', full: 'W3C, Web Authentication: An API for accessing Public Key Credentials, Level 3', url: 'https://www.w3.org/TR/webauthn-3/', year: 2026, type: 'spec' },
  { id: 'S2', short: 'FIDO2 CTAP2', full: 'FIDO Alliance, Client to Authenticator Protocol (CTAP) 2 i specyfikacje FIDO2', url: 'https://fidoalliance.org/specifications/', year: 2023, type: 'spec' },
  { id: 'S3', short: 'RFC 6238 (TOTP)', full: "D. M'Raihi i in., RFC 6238: TOTP: Time-Based One-Time Password Algorithm", url: 'https://datatracker.ietf.org/doc/rfc6238', year: 2011, type: 'spec' },
  { id: 'S4', short: 'RFC 4226 (HOTP)', full: "D. M'Raihi i in., RFC 4226: HOTP: An HMAC-Based One-Time Password Algorithm", url: 'https://datatracker.ietf.org/doc/html/rfc4226', year: 2005, type: 'spec' },
  { id: 'S5', short: 'EMVCo Contactless / 3DS', full: 'EMVCo, EMV Contactless Specifications i EMV 3-D Secure', url: 'https://www.emvco.com/specifications/', year: 2024, type: 'spec' },
  // Publikacje — FIDO2 / passkeys
  { id: 'P1', short: 'Lyastani i in. 2020', full: 'S. G. Lyastani i in., Is FIDO2 the Kingslayer of User Authentication? A Comparative Usability Study of FIDO2 Passwordless Authentication, IEEE S&P 2020', url: 'https://trust.cispa.saarland/publication/lyastani-20-sp/lyastani-20-sp.pdf', year: 2020, type: 'recenz.' },
  { id: 'P2', short: 'FIDO2 the Rescue? (CHI 2023)', full: 'FIDO2 the Rescue? Platform vs. Roaming Authentication on Smartphones, ACM CHI 2023, DOI 10.1145/3544548.3580993', url: 'https://doi.org/10.1145/3544548.3580993', year: 2023, type: 'recenz.' },
  { id: 'P3', short: 'FIDO2 w firmie (SecDev 2023)', full: 'Challenges with Passwordless FIDO2 in an Enterprise Setting: A Usability Study, IEEE SecDev 2023', url: 'https://arxiv.org/html/2308.08096v2', year: 2023, type: 'recenz.' },
  { id: 'P4', short: 'Lassak i in. 2024/2025', full: "L. Lassak i in., Why Aren't We Using Passkeys? Obstacles Companies Face Deploying FIDO2 Passwordless Authentication, USENIX Security 2024; badanie SOUPS 2025", url: 'https://www.usenix.org/system/files/soups2025-lassak.pdf', year: 2025, type: 'recenz.' },
  { id: 'P5', short: 'Device-bound vs synced (2025)', full: 'Device-Bound vs. Synced Credentials: A Comparative Evaluation of Passkey Authentication, ICISSP 2025', url: 'https://arxiv.org/pdf/2501.07380', year: 2025, type: 'recenz.' },
  { id: 'P6', short: 'NCSC: FIDO2 vs hasła', full: 'NCSC (UK), Comparing the security properties of traditional user credentials and FIDO2 credentials for personal use', url: 'https://www.ncsc.gov.uk/paper/traditional-user-and-fido2-credentials-personal-use', year: 2024, type: 'raport' },
  // Publikacje — MFA
  { id: 'P7', short: 'Karim i in. 2023', full: 'Karim i in., przegląd porównawczy metod MFA, International Journal of Data and Network Science, 2023', url: 'https://www.growingscience.com/ijds/Vol8/ijdns_2023_180.pdf', year: 2023, type: 'recenz.' },
  { id: 'P8', short: 'Porównanie 2FA (USEC 2014)', full: 'A Comparative Usability Study of Two-Factor Authentication, USEC 2014', url: 'https://arxiv.org/pdf/1309.5344', year: 2014, type: 'recenz.' },
  { id: 'P9', short: 'Percepcja MFA (przegląd)', full: 'Evaluating User Perception of Multi-Factor Authentication: A Systematic Review', url: 'https://www.researchgate.net/publication/335233025_Evaluating_User_Perception_of_Multi-Factor_Authentication_A_Systematic_Review', year: 2019, type: 'preprint' },
  { id: 'P10', short: 'AuthGuide (KU Leuven)', full: 'AuthGuide: Analyzing Security, Privacy and Usability Trade-offs in Multi-Factor Authentication, KU Leuven', url: 'https://lirias.kuleuven.be/server/api/core/bitstreams/6c5421d7-dd23-4403-906d-59bf0eac3b8e/content', year: 2024, type: 'recenz.' },
  { id: 'P11', short: 'Amft i in. (recovery MFA)', full: "S. Amft i in., We've Disabled MFA for You: An Evaluation of the Security and Usability of Multi-Factor Authentication Recovery Deployments, arXiv 2306.09708", url: 'https://arxiv.org/pdf/2306.09708', year: 2023, type: 'preprint' },
  { id: 'P12', short: 'Lyastani i in. (2FA w serwisach)', full: 'S. G. Lyastani i in., A Systematic Study of the Consistency of Two-Factor Authentication User Journeys on Top-Ranked Websites, arXiv 2210.09373', url: 'https://arxiv.org/pdf/2210.09373', year: 2023, type: 'preprint' },
  // Publikacje — biometria
  { id: 'P13', short: 'Biometria i PAD (IEEE Access)', full: 'Audio-Visual Biometric Recognition and Presentation Attack Detection: A Comprehensive Survey, IEEE Access 9, 2021', url: 'https://arxiv.org/pdf/2101.09725', year: 2021, type: 'recenz.' },
  { id: 'P14', short: 'PAD odcisku palca (przegląd)', full: 'A comprehensive survey of fingerprint presentation attack detection, Journal of Surveillance, Security and Safety, 2021', url: 'https://www.oaepublish.com/articles/jsss.2021.07', year: 2021, type: 'recenz.' },
  { id: 'P15', short: 'Marasco i in. 2023 (FingerPIN)', full: 'E. Marasco i in., Biometric multi-factor authentication: on the usability of the FingerPIN scheme, Security and Privacy (Wiley), 2023', url: 'https://onlinelibrary.wiley.com/doi/full/10.1002/spy2.261', year: 2023, type: 'recenz.' },
  { id: 'P16', short: 'PAD jako challenge-response', full: 'Presentation attack detection and biometric recognition in a challenge-response formalism, EURASIP Journal on Information Security, 2022', url: 'https://jis-eurasipjournals.springeropen.com/articles/10.1186/s13635-022-00131-y', year: 2022, type: 'recenz.' },
  // Ataki i studia przypadków
  { id: 'A1', short: 'Kikuchi 2025 (Evilginx)', full: 'Kikuchi, Impact Assessment of Adversary-in-the-Middle Attack: Evilginx Bypassing 2FA, Springer 2025', url: 'https://link.springer.com/chapter/10.1007/978-3-031-95652-2_14', year: 2025, type: 'recenz.' },
  { id: 'A2', short: 'Uber 2022 (MFA fatigue)', full: 'MFA Fatigue / Push Bombing — włamanie do Uber, wrzesień 2022 (BleepingComputer)', url: 'https://www.bleepingcomputer.com/news/security/mfa-fatigue-attacks-are-putting-your-organization-at-risk/', year: 2022, type: 'raport' },
  { id: 'A3', short: 'DEKRA: od SMS do SIM', full: 'DEKRA, From SMS to SIM: Security Analysis of Phone Number Verification', url: 'https://dekra.com/en/security-analysis-of-phone-number-verification', year: 2023, type: 'raport' },
  { id: 'A4', short: 'Basin i in. (EMV)', full: 'D. Basin i in., The EMV Standard: Break, Fix, Verify; obejście PIN w kartach zbliżeniowych', url: 'https://www.bankinfosecurity.com/emv-credit-card-flaw-allows-pin-bypass-a-14956', year: 2021, type: 'recenz.' },
  { id: 'A5', short: 'Relay EMV (S&P 2022, CCS 2020)', full: 'Practical EMV Relay Protection, IEEE S&P 2022; Security Analysis and Implementation of Relay-Resistant Contactless Payments, ACM CCS 2020', url: 'https://ieeexplore.ieee.org/document/9833642/', year: 2022, type: 'recenz.' },
  { id: 'A6', short: 'SoK: ataki na karty (2025)', full: 'Hofmeier, Basin i in., SoK: Attacks on Modern Card Payments, arXiv 2504.03363', url: 'https://arxiv.org/pdf/2504.03363', year: 2025, type: 'preprint' },
  { id: 'A7', short: 'Scaife i in. 2018 (skimmery)', full: 'N. Scaife i in., Fear the Reaper: Characterization and Fast Detection of Card Skimmers, USENIX Security 2018', url: 'https://www.usenix.org/system/files/conference/usenixsecurity18/sec18-scaife.pdf', year: 2018, type: 'recenz.' },
  { id: 'A8', short: 'Roland, Langer 2013', full: 'M. Roland, J. Langer, Cloning Credit Cards: A Combined Pre-play and Downgrade Attack on EMV Contactless, USENIX WOOT 2013', url: 'https://www.usenix.org/system/files/conference/woot13/woot13-roland.pdf', year: 2013, type: 'recenz.' },
  { id: 'A9', short: 'Płatności NFC (analiza)', full: 'Security Analysis of Near-Field Communication (NFC) Payments, arXiv 1904.10623', url: 'https://arxiv.org/pdf/1904.10623', year: 2019, type: 'preprint' },
  // Raporty
  { id: 'R1', short: 'FIDO Barometer 2024', full: 'FIDO Alliance, Online Authentication Barometer 2024', url: 'https://fidoalliance.org/wp-content/uploads/2024/10/Barometer-Report-Oct-31-2024-2.pdf', year: 2024, type: 'raport' },
  { id: 'R2', short: 'FIDO State of Passkeys 2026', full: 'FIDO Alliance, The State of Passkeys 2026: Global Consumer and Workforce Report', url: 'https://fidoalliance.org/the-state-of-passkeys-2026-global-consumer-and-workforce-report/', year: 2026, type: 'raport' },
  { id: 'R3', short: 'ENISA (raporty bieżące)', full: 'ENISA, bieżące raporty o uwierzytelnianiu i eIDAS', url: 'https://www.enisa.europa.eu/', year: 2025, type: 'raport' },
  // Wizualizacje
  { id: 'W1', short: 'Protocol Explorer', full: 'D. Sanjaya, Protocol Explorer (inspiracja wizualna)', url: 'https://protocol-explorer-alpha.vercel.app', year: 2025, type: 'repo' },
  { id: 'W2', short: 'crypto-lab-webauthn', full: 'systemslibrarian/crypto-lab-webauthn — interaktywne demo WebAuthn z symulacją ataków', url: 'https://github.com/systemslibrarian/crypto-lab-webauthn', year: 2024, type: 'repo' },
  { id: 'W3', short: 'Proser: passkey explainer', full: 'Z. Proser, What happens when you sign in with a passkey?', url: 'https://zackproser.com/demos/what-happens-when-you-sign-in-with-a-passkey', year: 2024, type: 'repo' },
  { id: 'W4', short: 'awesome-webauthn', full: 'yackermann/awesome-webauthn oraz passkeys.dev/demos', url: 'https://github.com/yackermann/awesome-webauthn', year: 2025, type: 'repo' },
  { id: 'W5', short: 'Authgear Passkey Demo', full: 'Authgear Passkey Demo / WebAuthn Tester', url: 'https://www.authgear.com/tools/passkey-demo/', year: 2025, type: 'repo' },
  // Dodane w sesji 2 (zweryfikowane 18.11.2026)
  { id: 'X1', short: 'Bonneau i in. 2012', full: 'J. Bonneau, C. Herley, P. C. van Oorschot, F. Stajano, The Quest to Replace Passwords: A Framework for Comparative Evaluation of Web Authentication Schemes, IEEE S&P 2012, DOI 10.1109/SP.2012.44', url: 'https://doi.org/10.1109/SP.2012.44', year: 2012, type: 'recenz.' },
  { id: 'X2', short: 'Lee i in. 2020 (SIM swap)', full: 'K. Lee, B. Kaiser, J. Mayer, A. Narayanan, An Empirical Study of Wireless Carrier Authentication for SIM Swaps, SOUPS 2020', url: 'https://www.usenix.org/conference/soups2020/presentation/lee', year: 2020, type: 'recenz.' },
  { id: 'X3', short: 'RFC 9106 (Argon2)', full: 'A. Biryukov i in., RFC 9106: Argon2 Memory-Hard Function for Password Hashing and Proof-of-Work Applications', url: 'https://www.rfc-editor.org/rfc/rfc9106', year: 2021, type: 'spec' },
  { id: 'X4', short: 'OWASP Password Storage', full: 'OWASP Password Storage Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html', year: 2025, type: 'norma' },
  { id: 'X5', short: 'CISA: number matching', full: 'CISA, Implementing Number Matching in MFA Applications (fact sheet)', url: 'https://www.cisa.gov/sites/default/files/publications/fact-sheet-implement-number-matching-in-mfa-applications-508c.pdf', year: 2022, type: 'raport' },
  { id: 'X6', short: 'ESET: NGate (2024)', full: 'ESET Research, NGate Android malware relays NFC traffic to steal cash', url: 'https://www.welivesecurity.com/en/eset-research/ngate-android-malware-relays-nfc-traffic-to-steal-cash/', year: 2024, type: 'raport' },
  { id: 'X7', short: 'BLIK (operator)', full: 'Polski Standard Płatności, BLIK — informacje o systemie', url: 'https://blik.com/', year: 2026, type: 'raport' },
  { id: 'X8', short: 'Zastrzeż PESEL (gov.pl)', full: 'Ministerstwo Cyfryzacji, Zastrzeż swój numer PESEL', url: 'https://www.gov.pl/web/gov/zastrzez-swoj-numer-pesel', year: 2024, type: 'raport' },
  { id: 'X9', short: 'Microsoft: number matching', full: 'Microsoft Learn, How number matching works in MFA push notifications', url: 'https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-mfa-number-match', year: 2025, type: 'spec' },
];

export const sourceById = Object.fromEntries(sources.map((s) => [s.id, s])) as Record<string, Source>;
