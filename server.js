//  npm run devStart
const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

class Block {
    constructor(id, longName, hexadecimal, bits) {
        this.id = id;
        this.hexadecimal = hexadecimal;
        
        this.bits = bits.substring(2, 15);
        this.firstFourBits = this.bits.substring(0, 4)
        this.lastNineBits = this.bits.substring(4)

        this.longName = longName;
        this.details = longName.includes("[") ? longName.split("[")[1].slice(0, -1).split(",") : ["no details"]; // split long name into minecraft:name and details], remove ] at the end and split into list
        
        this.name = longName == "null" ? "null": longName.split("[")[0].substring(10); // split long name into minecraft:name and details]
        this.oldName = this.name;

        // Change the name to get the image later
        const change = {
            "golden_rail": "powered_rail",
            "bed": "white_bed",
            "web": "cobweb",
            "noteblock": "note_block",
            "melon_block": "melon",
            "wooden_pressure_plate": "oak_pressure_plate",
            "deadbush": "dead_bush",
            "mob_spawner": "spawner",
            "monster_egg": "infested_stone"
        }

        Object.keys(change).forEach((name) => {
            if (this.name == name) {
                this.name = change[name];
            }
        })

        // if (this.name.includes('flowing_')) {
        //     this.name = this.name.split("_")[1]; // remove flowing_ from name. Example: flowing_water -> water
        //     this.details.push("flowing=true");
        // }

        if (this.details != "no details") {
            this.details.forEach((detail) => {
                if (detail.includes("variant")) {
                    const variant = detail.split("=")[1]; // get variant
                    const variantOnly = ['stone', 'dirt', 'sand'] // stone_variant is not a valid name, variant alone is
                    const variantShuffle = ['log', 'leaves', 'planks'] // log_variant is not a valid name, variant_log is

                    if (variantOnly.includes(this.name)) { 
                        if (this.name == 'stone' && variant.includes('smooth')) {
                            this.name = variant.replace("smooth", "polished")
                            return
                        }
                        this.name = variant 
                    } 
                    else if (variantShuffle.includes(this.name)) { 
                        this.name = variant + '_' + this.name 
                    }
                } else if (detail.includes("type")) {
                    const type = detail.split("=")[1]; // get type 
                    const typeOnly = ['red_flower', 'yellow_flower', 'tallgrass'] // stone_variant is not a valid name, variant alone is
                    const typeShuffel = ['sapling']; // sapling_variant is not a valid name, variant_sapling is
                    
                    if (typeOnly.includes(this.name)) { this.name = type }
                    else if (typeShuffel.includes(this.name)) { this.name = type + '_' + this.name }
                     
                    // if (this.name == "tallgrass") { this.name = type }
                } else if (detail.includes("color")) {
                    const color = detail.split("=")[1];
                    const colorShuffel = ['wool']

                    if (colorShuffel.includes(this.name)) { this.name = color + "_" + this.name}
                }
            })
        }  
        this.img = `https://minecraft-api.vercel.app/images/blocks/${this.name}.png`;      
    }
}

function getBlocks(){
    let blocklist = fs.readFileSync('data/block_state_id_list_by_masa.txt', 'utf8');
    let data = new Object();
    // create Block instance for each line
    blocklist.split(/\r?\n/).forEach(line =>  {
        const blockData = line.split(" ");
        data[blockData[0]] = new Block(blockData[0], blockData[3], blockData[1], blockData[2])
    })
    // object containing Block instances
    return data
}

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/api/blocklist", (req, res) => {
    const data = getBlocks();
    res.send(data);
})

app.post("/submit", async (req, res) => {
    const data = getBlocks();
    const idName = req.body.block_name;
    const id = idName.split(":")[0] // split id: name into ['id', ' name']
    const name = idName.split(" ")[1] // split id: name into ['id:', 'name']

    if (idName == "" || !/[0-9]+: [a-z]+/.test(idName)) {
        res.redirect("/")
        return
    }

    const submittedBlock = data[id];

    let firstBlocks = new Array();
    let lastBlocks = new Array();

    Object.keys(data).forEach((element) => {
        const block = data[element];
        if (block.name == name.toString() || block.name == "null") { return }
        
        // It is a valid block and not itself
        if (block.firstFourBits === submittedBlock.firstFourBits) {
            // First 4 bits from the block match
            firstBlocks.push(block)
        } else if (block.lastNineBits === submittedBlock.lastNineBits) {
            // Last 9 bits from the block match
            lastBlocks.push(block)
        } else { return }
    })

    res.render("result", { block: submittedBlock, first_blocks: JSON.stringify(firstBlocks), last_blocks: JSON.stringify(lastBlocks)})
})

app.listen(process.env.PORT || 3000)