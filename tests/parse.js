let temp = [{
    "type": "lmao"
}, {
    "name": "John",
    "age": 20
}, {
    "name": "David",
    "age": 16
}];

params = "name:John,age:>18";

function parseCustomSearch(params, data) {
    let q = {};
    params.split(",").forEach(i => (q[i.split(":")[0]] = i.split(":")[1]));
    let filtered = [];
    let keysSize = Object.keys(q).length;
    console.log("To filter: " + keysSize);
    filtered = data.filter(element => { // {"name":"john", "age": 20}
        let result = false;
        let resultArray = [];
        console.log(element);
        Object.entries(q).forEach(([key, value]) => { // "age": ">18", "name": "John"
            console.log(`-----------------------------------------\nhere: ${element[key]}`);
            if (typeof element[key] === "undefined") {
                resultArray.push(false)
            } else if (value.startsWith(">=")) {
                console.log(`${key} more than or equal to ${value.substr(2)}: ${element[key]} [${element[key] >= parseFloat(value.substr(2))}]`);
                resultArray.push(element[key] >= parseFloat(value.substr(2)));
            } else if (value.startsWith("<=")) {
                console.log(`${key} less than or equal to ${value.substr(2)}: ${element[key]} [${element[key] <= parseFloat(value.substr(2))}]`);
                resultArray.push(element[key] <= parseFloat(value.substr(2)));
            } else if (value.startsWith(">")) {
                console.log(`${key} more than ${value.substr(1)}: ${element[key]} [${element[key] > parseFloat(value.substr(1))}]`);
                resultArray.push(element[key] > parseFloat(value.substr(1)));
            } else if (value.startsWith("<")) {
                console.log(`${key} less than ${value.substr(1)}: ${element[key]} [${element[key] < parseFloat(value.substr(1))}]`);
                resultArray.push(element[key] < parseFloat(value.substr(1)));
            } else {
                console.log(`${key} equal ${value}: ${element[key]} [${element[key] === value}]`);
                resultArray.push(element[key] === value);
            }
        });

        console.log("-----------------------------------------")
        return resultArray.filter(element => {
            return element;
        }).length === keysSize;
    })

    return filtered;
}

console.log(parseCustomSearch(params, temp));