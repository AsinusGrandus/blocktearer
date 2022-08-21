const columnIds = ['#first_blocks_column_grid', '#last_blocks_column_grid']

// Create two columns with blocks
columnIds.forEach((id) => {
    const blockColumn = document.querySelector(id); // get column
    const blocks = JSON.parse(blockColumn.dataset.blocks); // get block data

    let Used = new Array();

    blocks.forEach((element) => {
        if (Used.includes(element.name)) {
            // the block is already used
            // A <p> and <img> are combined into a <div> that has an array with details and the block it belongs to as dataset
            const detailsDiv = document.getElementById(element.name);

            if (detailsDiv == "undefined") {return}

            const blockArray = JSON.parse(detailsDiv.dataset.details);
            blockArray.push(element);
            detailsDiv.dataset.details = JSON.stringify(blockArray);

            return
        }

        // Create <div> element that will contain <p> and <img> 
        const div = document.createElement('div');
        div.id = element.name;
        div.classList.add('block')
        div.addEventListener("click", function(){ popUp(element.name); });
        div.dataset.details = JSON.stringify([element]);
        div.dataset.block = JSON.stringify([element]);
        // append to column
        blockColumn.appendChild(div);

        // Create <img> element
        const img = document.createElement('img');
        img.src = element.img
        img.setAttribute("height", "50");
        img.setAttribute("width", "50");
        img.addEventListener("error", function(){ 
            this.onerror=null;
            this.src='https://minecraft-api.vercel.app/images/blocks/air.png'
            });
        div.appendChild(img)

        // Create <p> element
        const blockP = document.createElement('p');
        const text = document.createTextNode(element.oldName);
        blockP.appendChild(text); // add text to <p>
        div.appendChild(blockP); // add to <div>
                    
        // mark element as used
        Used.push(element.name)
    })

})

function toggleModal() {
    const modal = document.querySelector(".modal");
    modal.classList.toggle("show-modal");
}

function popUp(id) {
    const closeButton = document.querySelector(".close-button");
    closeButton.addEventListener("click", toggleModal);

    const dataDiv = document.getElementById(id);
    const details = JSON.parse(dataDiv.dataset.details); // [{},{}]
    const block = JSON.parse(dataDiv.dataset.block)[0];

    // const imgImg = document.getElementById("blockimg");
    // imgImg.src = block.img;

    const nameH = document.getElementById('blockname');
    nameH.innerHTML = 'Name: ' + block.name;

    const bitsDiv = document.getElementById('bits');
    bitsDiv.innerHTML = 'Bits: ' + block.firstFourBits + ' ' + block.lastNineBits;

    const detailDiv = document.getElementById('details');
    let detailDivText = "Details:<br>";
    

    details.forEach((block) => {
        let detailText = new String();
        block.details.forEach((detail) => {
            detailText += detail + ", ";
        })
        detailDivText += block.id + ': ' + detailText.slice(0, -2) + "<br>";
    })
    // Make this prettier
    detailDiv.innerHTML = detailDivText;

    toggleModal()
}