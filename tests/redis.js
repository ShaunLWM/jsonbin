const redis = require("../modules/connector/redis");
let db = new redis();
// console.log(db.keyExists("lol"))

// db.addObj("lol", {
//     name: "lame1",
//     id: "id1"
// })

// db.addObj("lol", {
//     name: "lame2",
//     id: "id2"
// })



(async function() {
    // console.log(await db.get("bin_75bf73bc-40d6-4010-a165-5a457468c4b1"))
    // console.log("Done");
    // let res = await db.get("bin_75bf73bc-40d6-4010-a165-5a457468c4b1", "company");
    // console.log((await db.get("bin_75bf73bc-40d6-4010-a165-5a457468c4b1", "company"))[1])

    console.log((await db.get("bin_75bf73bc-40d6-4010-a165-5a457468c4b1", "company")))
})();