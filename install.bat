@echo off
ECHO Installing dependencies for union-auto-bot...

:: Set error flag
SET "ERROR_OCCURRED=0"

:: Install dependencies individually
ECHO Installing dependencies...
npm install @cosmjs/cosmwasm-stargate@^0.32.4 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install @cosmjs/encoding@^0.32.4 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install @cosmjs/proto-signing@^0.32.4 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install @cosmjs/stargate@^0.32.4 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install @noble/secp256k1@^2.2.3 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install axios@^1.9.0 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install cli-table3@^0.6.5 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install dotenv@^16.5.0 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install ethers@^6.14.3 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install inquirer@^8.2.6 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install js-yaml@^4.1.0 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install moment-timezone@^0.5.48 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install node-fetch@^3.3.2 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install viem@^2.30.6 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"
npm install winston@^3.17.0 --loglevel=verbose >> install_log.txt 2>&1 || SET "ERROR_OCCURRED=1"

IF %ERROR_OCCURRED% NEQ 0 (
    ECHO Error: Failed to install some dependencies. Check install_log.txt for details.
    goto :ERROR_HANDLING
)

ECHO All dependencies installed successfully!
goto :KEEP_OPEN

:ERROR_HANDLING
ECHO.
ECHO An error occurred. Check the messages above for details.
IF EXIST install_log.txt (
    ECHO Detailed logs are available in install_log.txt.
)

:KEEP_OPEN
ECHO.
ECHO This window will remain open. Press Ctrl+C to close or type 'exit' to quit.
cmd /k
