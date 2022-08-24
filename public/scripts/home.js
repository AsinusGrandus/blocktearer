fetch("/api/blocklist").then((response) => response.json()).then((data) => { 
    const datalist = document.getElementById('block_name');
    let Used = new Object();

    Object.keys(data).forEach((key) => {
        const element = data[key]
        const name = element.name;
        const id = element.id;
        if(name == "null"){return}

        // Add to options
        const option = document.createElement('option');
        option.value = `${id}: ${name}`;
        datalist.appendChild(option);
        Used[element.name] = element;
    });

    document.getElementById('blockname').addEventListener('change', function() {
        const idName = document.getElementById('blockname')
        // const details = document.getElementById('details');
        const id = idName.value == "" ? "null": idName.value.split(":")[0] // split id: name into ['id', ' name']

        if (id == "null") {return}

        idName.value = ' ' + id + ': ' + data[id].name
        // details.style.color = 'white';
        // details.innerHTML = data[id].details;

    });
});