const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const maptoken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: maptoken});
const {cloudinary} = require('../cloudinary');

module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({});
    const pagenum =  parseInt(req.params.pagenum)*10;
    res.render('campgrounds/index', { campgrounds , pagenum });
}

module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req,res) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.author = req.user._id;
    campground.images = req.files.map(f => ({ url: f.path , filename : f.filename}));
    await campground.save();
    req.flash('success','Successfully Made a New Campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req,res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error','Campground Not Found');
        return res.redirect('/campgrounds/index/1');
    }
    res.render('campgrounds/show',{ campground });
}

module.exports.renderEditForm = async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error','Campground Not Found');
        return res.redirect('/campgrounds/index/1');
    }
    res.render('campgrounds/edit',{ campground });
}

module.exports.updateCampground = async (req,res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id,{...req.body.campground});
    const imgs = req.files.map(f => ({ url: f.path , filename : f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images:{ filename: {$in: req.body.deleteImages } } } })
    }
    req.flash('success','Updated Successfully');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req,res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success','Successfully Deleted Campground');
    res.redirect('/campgrounds');
}