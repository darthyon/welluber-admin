graph TD
    Start([Host Admin Portal]) --> Decide{Which config?}
    
    %% COMMISSION
    Decide -->|Commission| CommNav["HOST: Go to SP detail (SCR-SP-05)<br/>Click 'Commission' tab"]
    CommNav --> CommLoad["SYSTEM: Load commission schema<br/>Table: Category | Rate Redeemed |<br/>Rate Expired | Last Updated<br/>🔄 [API]<br/>Show only SP's selected categories"]
    CommLoad --> CommInput["HOST: Enter rates<br/>Per category:<br/>- Redeemed: 0.10–0.30 (10–30%)<br/>- Expired: 0.10–0.30<br/>Can differ or lock to same"]
    CommInput --> CommVal["SYSTEM: Real-time validation<br/>⚠️ 0.10 ≤ rate ≤ 0.30"]
    CommVal -->|Invalid| CommErr["❌ Show error<br/>Save disabled"]
    CommErr --> CommInput
    CommVal -->|Valid| CommSave["HOST: Click 'Save'"]
    CommSave --> CommPersist["🔄 SYSTEM: [API] [PERSIST]<br/>Save rates<br/>Apply to ALL future transactions<br/>⚠️ Past transactions immutable<br/>Log: 'Commission: [breakdown]'"]
    CommPersist --> CommExit["✓ Commission saved<br/>EXIT: Config complete"]
    
    %% CRON
    Decide -->|Cron Defaults| CronNav["HOST: Go to SCR-CFG-02<br/>(Global Cron Settings)"]
    CronNav --> CronLoad["SYSTEM: Load current defaults<br/>- Cancellation window: [val] [unit]<br/>  (default 3 hours)<br/>- Validity period: [val] [unit]<br/>  (default 15 days)<br/>- Settlement cycle: [freq]<br/>  (default Monthly)"]
    CronLoad --> CronInput["HOST: Update values<br/>- Cancellation: numeric + unit<br/>- Validity: numeric + unit<br/>- Settlement: dropdown"]
    CronInput --> CronVal["SYSTEM: Validate ranges<br/>⚠️ Cancellation: 30min–7days<br/>Validity: 1day–365days"]
    CronVal -->|Outside range| CronWarn["⚠️ Warning banner<br/>'Outside recommended range'<br/>Host can confirm to proceed"]
    CronWarn --> CronPreview
    CronVal -->|In range| CronPreview["SYSTEM: Show impact preview<br/>'[X] pending vouchers affected<br/>within [timeframe]'"]
    CronPreview --> CronSave["HOST: Click 'Save Settings'"]
    CronSave --> CronPersist["🔄 SYSTEM: [API] [PERSIST]<br/>Save new defaults<br/>Apply to FUTURE cron jobs only<br/>⚠️ No retroactive changes<br/>Log action"]
    CronPersist --> CronExit["✓ Settings saved<br/>EXIT: Config complete"]
    
    %% EXPIRED VOUCHER SPLIT
    Decide -->|Expired Split| ExpNav["HOST: Go to SCR-CFG-03<br/>(Expired Voucher Policy)"]
    ExpNav --> ExpLoad["SYSTEM: Load current split<br/>% Org Refund | % SP Ledger |<br/>% Welluber Commission<br/>(must sum to 100%)"]
    ExpLoad --> ExpInput["HOST: Adjust percentages<br/>Three fields or sliders<br/>Real-time sum validation"]
    ExpInput --> ExpVal["SYSTEM: Validate sum<br/>⚠️ Must = 100%"]
    ExpVal -->|Invalid| ExpErr["❌ Show error<br/>'Sum must = 100%<br/>Current: [X]%'<br/>Save disabled"]
    ExpErr --> ExpInput
    ExpVal -->|Valid| ExpPreview["SYSTEM: Show preview<br/>'RM 1,000 expired:<br/>Org RM [X], SP RM [Y],<br/>Welluber RM [Z]'"]
    ExpPreview --> ExpSave["HOST: Click 'Save Policy'"]
    ExpSave --> ExpPersist["🔄 SYSTEM: [API] [PERSIST]<br/>Save split<br/>Apply to FUTURE expired vouchers<br/>⚠️ Past splits immutable<br/>Log action"]
    ExpPersist --> ExpExit["✓ Policy saved<br/>EXIT: Config complete"]
    
    classDef host fill:#fff9c4,stroke:#f57f17,stroke-width:2px,color:#000
    classDef system fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef decision fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
    classDef exit fill:#c8e6c9,stroke:#1b5e20,stroke-width:2px,color:#000
    
    class CommNav,CommInput,CommSave,CronNav,CronInput,CronSave,ExpNav,ExpInput,ExpSave host
    class CommLoad,CommVal,CommPersist,CronLoad,CronVal,CronWarn,CronPreview,CronPersist,ExpLoad,ExpVal,ExpPreview,ExpPersist system
    class Decide,CommVal,CronVal,ExpVal decision
    class CommErr,CronVal,ExpErr error
    class CommExit,CronExit,ExpExit exit
