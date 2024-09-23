const readline = require('readline')
const fs = require('fs').promises;
const path = require('path');
const converter = require('json-2-csv');
const csvToJson = require('csvtojson');
function readInput(promptMessage) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve, reject) => {
        rl.question(promptMessage, (input) => {
            rl.close()
            resolve(input)
        })
    })
}
let json2csvCallback = function (err, csv) {
    if (err) throw err;
    fs.writeFile(path.join(__dirname, 'stock_price_data_files/OutPut' + 'stockfile.csv'), csv, 'utf8', function (err) {
        if (err) {
            console.log('Some error occured - file either not saved or corrupted file saved.');
        } else {
            console.log('It\'s saved!');
        }
    })
};

async function readFiles(folderPath, noOfFile) {
    try {
        var outArray = [];
        const files = await fs.readdir(folderPath);
        if (files) {
            const fileCount = files.length > noOfFile ? noOfFile : files.length
            for (let i = 0; i < fileCount; i++) {
                var tempArray = []
                const filePath = path.join(folderPath, files[i]);
                //const content = await fs.readFile(filePath, 'utf8');
                console.log(filePath)
                tempArray = await processRecipients(filePath)
                let mean = tempArray.reduce((total, next) => total + next.price) / tempArray.length;
                console.log(mean)
                tempArray.forEach((item) => {
                    outArray.push({
                        'StockId': item.StockId,
                        'Timestamp': item.Timestamp,
                        'price': item.price,
                        'mean': mean,
                        'mean of actual stock price':Number(item.price) - mean
                    })
                })           // console.log(outArray)

            }

            return outArray
        }
        else {
            console.error('no file found:', err);
        }
    } catch (err) {
        console.error('Error reading files:', err);
    }
}
const processRecipients = async (filePath) => {
    var outArray = [];
    if (path.extname(filePath) === '.csv') {

        const recipients = await csvToJson({
            trim: true
        }).fromFile(filePath);

        // Code executes after recipients are fully loaded.
        if (recipients) {
            recipients.forEach((recipient) => {
                if (outArray.length < 30) {
                    outArray.push({
                        'StockId': recipient.StockID,
                        'Timestamp': recipient.Timestamp,
                        'price': recipient.price
                    })
                }
            });
        } else {
            console.log('nofile content notavailable')
        }
    } else {
        console.log('invalid extension')
    }
    return outArray


};
async function main() {
    const noOfFile = await readInput("Please enter number of files to be read?")
    console.log(`Hello-- ${noOfFile}`)
    var outPut = []; 
    // Specify the folder path and file name
    var files = await fs.readdir(path.join(__dirname, 'stock_price_data_files'));
    // console.log(files)
    for await(const dir of files){
        const folderPath = path.join(__dirname, 'stock_price_data_files/' + dir); // 'files' is the folder containing example.txt
        const ressult=await readFiles(folderPath, noOfFile)
        outPut.push(ressult)
       
    }
    console.log(outPut)
    converter.json2csv(outPut[0], json2csvCallback, {
        prependHeader: false      // removes the generated header of "value1,value2,value3,value4" (in case you don't want it)
      });
      
}

main()