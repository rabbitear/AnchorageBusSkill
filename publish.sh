if [ -e index.zip ]
then
    echo "[+] Deleting old index.zip."
    rm index.zip
fi
if [ -d lambda ]
then
    cd lambda
else
    echo "[*] WARN: could not find lambda directory in cwd."
    exit 1
fi
7z a -r ../index.zip
if [ $? -gt 0 ]
then
    echo "[*] Something went wrong while zipping."
    exit 1
    cd ..
fi
cd ..
echo "[+] Trying to upload code, please wait..."
aws lambda update-function-code --function-name anchorgeBus \
    --zip-file fileb://index.zip
if [ $? -gt 0 ]
then
    echo "[*] WARNING, code NOT updated!"
else
    echo "[+] All done!! Thanks for using the publish script."
fi

