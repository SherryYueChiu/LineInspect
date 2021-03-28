adb shell
run-as com.linecorp.linelite
chmod 777 databases
chmod 777 databases/LINE_LITE
cp /data/data/com.linecorp.linelite/databases/LINE_LITE /sdcard
exit
exit
adb pull /sdcard/LINE_LITE
mv LINE_LITE LINE_LITE.db