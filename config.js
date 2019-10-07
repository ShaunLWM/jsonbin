module.exports = {
    serverPort: 5000,
    redisExtension: "bin_",
    collectionLength: 20,
    mainExplanation: [{
            method: "GET",
            path: "/genid",
            description: "Get your bin token to use"
        },
        {
            method: "POST",
            path: "/bin_id[/collection_name]",
            description: "Post new data into bin. Usage of collection (20 chars) is allowed as well",
            example: `curl -X POST '/<bin_id>' -H 'content-type: application/json' -d '{"id": "LegendarySeal", "score": 300}'`
        },
        {
            method: "GET",
            path: "/bin_id[/collection_name]",
            description: "Retreive your data from bin. Perform custom query using the 'q' paramter or sort them in ascending '?sort=age' or descending order '?sort=-age'",
            example: `curl -X GET '/bin_id' || curl -X GET '/bin_id/collection_name' || curl -X GET '/bin_id?q=id:Tim,score:24' || curl -X GET '/bin_id?sort=-score'`
        },
        {
            method: "DELETE",
            path: "/<bin_id>[/collection_name]",
            description: "Delete your bin or specific collection.",
            example: `curl -X DELETE '/bin_id' || curl -X DELETE '/<bin_id>/collection_name'`
        },
        {
            method: "PUT",
            path: "/<bin_id>[/collection_name]",
            description: "Update the data in the specified bin or collection",
            example: `curl -X PUT '/bin_id' -H 'content-type: application/json' -d '{"id": "LegendarySeal", "score": 500}'`
        }
    ]
}