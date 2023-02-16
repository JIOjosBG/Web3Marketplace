const uploadImageView = async (req, res) =>  {
    const image = req.file;
    res.send({message: 'File uploaded successfully.',pathToImage: `/i/${image.filename}`});  
}

module.exports = { uploadImageView };