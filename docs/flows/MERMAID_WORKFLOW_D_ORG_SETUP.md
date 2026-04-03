graph TD
    Start([Org Setup Flow]) --> HostCreate["HOST: Create org account<br/>- Company name<br/>- Registration no.<br/>- Industry | Org type<br/>- Financial year start<br/>- Subscription plan"]
    HostCreate --> HostPersist1["🔄 SYSTEM: [API] [PERSIST]<br/>Save org (status=Active)<br/>Create default HQ branch"]
    HostPersist1 --> HostAddAdmin["HOST: Add Org Admin user<br/>User Mgmt → Add User<br/>Name + Email<br/>Role = Org Admin"]
    HostAddAdmin --> HostInvite["SYSTEM: Generate magic link<br/>60 min expiry<br/>Send email to Org Admin"]
    HostInvite --> OrgAdminReceive["<b>ORG ADMIN receives email</b><br/>Clicks magic link<br/>(opens app directly, no browser)"]
    OrgAdminReceive --> OrgAdminSetup["ORG ADMIN: Completes account setup<br/>- Name<br/>- Password-free SSO<br/>  (Google/Apple)"]
    OrgAdminSetup --> OrgAdminLogin["ORG ADMIN: Logged into<br/>Welluber Org Portal<br/>Dashboard unlocked"]
    
    %% Parallel: Host continues while Org Admin logs in
    HostInvite --> HostAssign["<b>HOST (parallel):<br/>continues config</b><br/>Assigns policies to org"]
    HostAssign --> HostAssignPersist["🔄 SYSTEM: [API] [PERSIST]<br/>Policies added to org<br/>(Org Admin sees in wizard)"]
    HostAssignPersist --> HostWallet["HOST: Creates branch wallet<br/>- Model: Cash Balance or<br/>  Credit Limit<br/>- Balance initially = 0"]
    HostWallet --> HostWalletPersist["🔄 SYSTEM: [API] [PERSIST]<br/>Wallet created<br/>Sends payment link to Org Finance"]
    HostWalletPersist --> HostDone["HOST: Org setup config complete<br/>Org ready for employees"]
    
    %% Org Admin workflow
    OrgAdminLogin --> OrgAdminSelfServe["ORG ADMIN (v2: self-serve)<br/>v1: Host does on behalf<br/><br/>- Upload employee CSV<br/>- Review employees<br/>- Trigger bulk invites<br/>- Assign policies to employees<br/>- Fund branch wallet via<br/>  payment gateway"]
    OrgAdminSelfServe --> OrgAdminWalletTop["ORG ADMIN: Fund wallet<br/>Receives payment link from Host<br/>Clicks → Payment Gateway<br/>Enters amount → Pays"]
    OrgAdminWalletTop --> PaymentGW["🔄 PAYMENT GATEWAY:<br/>Process payment<br/>✓ Success OR ❌ Failed"]
    PaymentGW -->|Success| WalletCredit["SYSTEM: Credit wallet<br/>🔄 [API] [PERSIST]<br/>Balance updated<br/>Employees can now transact"]
    PaymentGW -->|Failed| PaymentError["❌ Payment failed<br/>Show error<br/>Org Admin can retry"]
    PaymentError --> OrgAdminWalletTop
    WalletCredit --> Exit["✓ Org activation complete<br/>Employees can:<br/>- Download member app<br/>- Link corporate identity<br/>- Access benefit wallet<br/>- Browse marketplace<br/>- Purchase vouchers<br/><br/>EXIT: Onboarding complete"]
    HostDone -.Parallel.-> OrgAdminLogin
    
    classDef host fill:#fff9c4,stroke:#f57f17,stroke-width:2px,color:#000
    classDef orgadmin fill:#e1bee7,stroke:#6a1b9a,stroke-width:2px,color:#000
    classDef system fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef payment fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
    classDef exit fill:#c8e6c9,stroke:#1b5e20,stroke-width:2px,color:#000
    
    class HostCreate,HostAddAdmin,HostAssign,HostWallet,HostDone host
    class OrgAdminReceive,OrgAdminSetup,OrgAdminLogin,OrgAdminSelfServe,OrgAdminWalletTop orgadmin
    class HostPersist1,HostInvite,HostAssignPersist,HostWalletPersist,OrgAdminSetup,WalletCredit system
    class PaymentGW payment
    class PaymentError error
    class Exit exit
