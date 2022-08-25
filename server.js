//  npm run devStart
const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static('public'));
app.set('view engine', 'ejs')

class Block {
    constructor(id, longName, hexadecimal, bits) {
        this.id = id;
        this.hexadecimal = hexadecimal;
        
        this.bits = bits.substring(2, 15);

        this.longName = longName;
        this.details = longName.includes("[") ? longName.split("[")[1].slice(0, -1).split(",") : ["no_details"]; // split long name into minecraft:name and details], remove ] at the end and split into list
        
        this.name = longName == "null" ? "null": longName.split("[")[0].substring(10); // split long name into minecraft:name and details]
        this.oldName = this.name;


        // Change the name to get the image from the api later
        const change = {
            "golden_rail": "powered_rail",
            "bed": "white_bed",
            "web": "cobweb",
            "noteblock": "note_block",
            "melon_block": "melon",            
            "deadbush": "dead_bush",
            "mob_spawner": "spawner",
            "monster_egg": "infested_stone",
            "brick_block": "bricks",
            "magma": "magma_block",
            "stained_hardened_clay": "terracotta",
            "quartz_ore": "nether_quartz_ore",
            "nether_brick": "nether_bricks",
            "lit_pumpkin": "jack_o_lantern",
            "fence_gate": "oak_fence_gate",
            "fence": "oak_fence",
            "trapdoor": "oak_trapdoor",
            "standing_sign": "oak_sign",
            "wall_sign": "oak_wall_sign",
            "standing_banner": "white_banner",
            "wall_banner": "white_banner",
            "snow_layer": "snow",
            "reeds": "sugar_cane",
            "portal": "nether_portal",
            "stonebrick": "stone_bricks",
            "waterlily": "lily_pad",
            "slime": "slime_block",
            "red_nether_brick": "red_nether_bricks"
        }

        const replace = {
            "wooden": "oak",
            "silver": "light_gray",
            "unlit_": "",
            "lit_": "",
            "unpowered_": "",
            "powered_": "",
            "_inverted": ""
        }

        Object.keys(change).forEach((name) => {
            if (this.name == name) {
                this.name = change[name];
            }
        })

        Object.keys(replace).forEach((name) => {
            if (this.name.includes(name)) {
                this.name = this.name.replace(name, replace[name])
            } 
        })
        
        if (this.name == "skull") {
            this.name = "skeleton_head";
            // Can't find corresponding blockstate ids
            // const player = [];
            // const zombie = [];
            // const skeleton = [];
            // const creeper = [];
            // if (player.includes(this.id)) {
            //     this.name = "player_head";
            //     return
            // }
            // if (zombie.includes(this.id)) {
            //     this.name = "zombie_head";
            //     return
            // }
            // if (skeleton.includes(this.id)) {
            //     this.name = "skeleton_head";
            //     return
            // }
            // if (creeper.includes(this.id)) {
            //     this.name = "creeper_head";
            //     return
            // }
        }

        if (this.details != "no_details") { 
            this.details.forEach((detail) => {
                if (detail.includes("variant")) {
                    const variant = detail.split("=")[1]; // get variant
                    const variantOnly = ['stone', 'dirt', 'sand'] // stone_variant is not a valid name, variant alone is
                    const variantShuffle = ['log', 'leaves', 'planks'] // log_variant is not a valid name, variant_log is

                    if (this.name == 'double_plant') {
                        const double_plant = {
                            "double_grass": "tall_grass",
                            "double_fern": "large_fern",
                            "double_rose": "rose_bush",
                            "syringa": "lilac",
                            "sunflower": "sunflower",
                            "paeonia": "peony"
                        }
                        const new_name = double_plant[variant]
                        this.name = new_name == undefined ? "tall_grass": new_name;

                    } else if (variantOnly.includes(this.name)) { 
                        if (this.name == 'stone' && variant.includes('smooth')) {
                            this.name = variant.replace("smooth", "polished");
                        } else {
                            this.name = variant;
                        }
                    } else if (variantShuffle.includes(this.name)) { 
                        this.name = variant + '_' + this.name;
                    }
                } else if (detail.includes("type")) {
                    const type = detail.split("=")[1]; // get type 
                    const typeOnly = ['red_flower', 'yellow_flower', 'tallgrass'] // stone_variant is not a valid name, variant alone is
                    const typeShuffel = ['sapling']; // sapling_variant is not a valid name, variant_sapling is
                    
                    if (typeOnly.includes(this.name)) { 
                        if (type == 'houstonia') {
                            this.name = "azure_bluet";
                        } else {
                            this.name = type;
                        }
                    } else if (typeShuffel.includes(this.name)) { 
                        this.name = type + '_' + this.name 
                    }
                } else if (detail.includes("color")) {
                    let color = detail.split("=")[1];
                    const colorShuffel = ['wool', 'concrete', 'concrete_powder', 'glass_pane', 'terracotta', 'glass', 'stained_glass_pane', 'carpet'];
    
                    if (color == 'silver') { color = 'light_gray'}
    
                    if (colorShuffel.includes(this.name)) { this.name = color + "_" + this.name}
                }
            })
    
            if (this.name == "stained_glass") {
                this.name = "white_stained_glass";
            }
            if (this.name == "stained_glass_pane") {
                this.name == "white_stained_glass_pane";
            }    
        }

        this.img = `https://minecraft-api.vercel.app/images/blocks/${this.name}.png`;

        if (this.name == 'piston_extension') {
            this.img = 'https://static.wikia.nocookie.net/minecraft/images/3/3e/MissingTextureBlock.png';
        } 
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

app.get("/api/blocklist", (req, res) => {
    const data = getBlocks();
    res.send(data);
})

app.get("/", (req, res) => {
    res.render("selector")
})

app.get("/locations", (req, res) => {
    res.render("locations")
})

app.post("/result", async (req, res) => {
    const data = getBlocks();
    const idName = req.body.block_name;
    const id = idName.split(":")[0].replace(' ','') // split id: name into ['id', ' name']
    const name = idName.split(" ")[1] // split id: name into ['id:', 'name']

    if (idName == "" || !/[0-9]+: [a-z]+/.test(idName)) {
        res.redirect("/")
        return
    }

    const submittedBlock = data[id];

    res.render("result", { block: submittedBlock, allBlocks: JSON.stringify(data)})
})

app.listen(process.env.PORT || 3000)