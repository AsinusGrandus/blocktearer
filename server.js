//  npm run devStart
const fs = require('fs');
const express = require('express');
const app = express();

function getBlocklist(){
    let blocklist = fs.readFileSync('data/block_state_id_list_by_masa.txt', 'utf8');
    let data = new Object();
    blocklist.split(/\r?\n/).forEach(line =>  {
        const blockData = line.split(" ");
        data[blockData[0]] = {
            "id": blockData[0],
            "name": blockData[3],
            "0x": blockData[1],
            "bits": blockData[2].substring(2, 15),
        }
    })
    return data
}

function getIdbyName(block_name) {
    let id = new String();
    const data = getBlocklist()
    for (let element of Object.keys(data)) {
        const name = data[element]["name"]
        const shortname = name.split("[")[0].substring(10)
        if (block_name == name || block_name == shortname) {
            id = element
            break
        }
    }
    return id
}

app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs')

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/api/blocklist", (req, res) => {
    const data = getBlocklist();
    res.send(data);
})

app.post("/submit", async (req, res) => {
    const data = getBlocklist();
    const name = req.body.block_name;
    const id = await getIdbyName(name)

    const blockInfo = data[id];
    const firstBits = blockInfo["bits"].substring(0, 4);
    const lastBits = blockInfo["bits"].substring(4);

    let firstBlocks = new Array();
    let lastBlocks = new Array();

    Object.keys(data).forEach((element) => {
        const block = data[element];
        if (block["name"] == name.toString() || block["name"] == "null") { return }
        if (block["bits"].substring(0, 4) === firstBits) {
            firstBlocks.push(block["name"])
        } else if (block["bits"].substring(4) === lastBits) {
            lastBlocks.push(block["name"])
        } else { return }
    })

    res.render("result", { block_name: name, first_blocks: firstBlocks, last_blocks: lastBlocks})
})

app.listen(process.env.PORT || 3000)