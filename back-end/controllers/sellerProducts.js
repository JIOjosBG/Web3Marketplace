const getProducts = async (req, res) => {
    // console.log(req);
    res.send("getProducts");
    console.log("getProducts");
}

const getProduct = async (req, res) => {
    // console.log(req);
    console.log(req.params.id);
    res.send("getProduct");
    console.log("getProduct");
}

const createProduct = async (req, res) => {
    // console.log(req);
    res.send("createProduct");
    console.log("createProduct");
}

const updateProduct = async (req, res) => {
    // console.log(req);    
    console.log(req.params.id);
    res.send("updateProduct");
    console.log("updateProduct");
}

export { getProduct, createProduct, getProducts, updateProduct};