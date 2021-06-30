const Campground = require('../models/campground');
const Review = require('../models/review') 

module.exports.createReview = async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review= new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Review Added');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req,res) => {
    await Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.revid}})
    await Review.findByIdAndDelete(req.params.revid);
    req.flash('Review Deleted Successfully');
    res.redirect(`/campgrounds/${req.params.id}`)
}