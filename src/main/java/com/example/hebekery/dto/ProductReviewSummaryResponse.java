package com.example.hebekery.dto;

import java.util.List;

public class ProductReviewSummaryResponse {
    private List<ProductReviewResponse> reviews;
    private boolean canReview;
    private ProductReviewResponse myReview;
    private double averageRating;
    private int reviewCount;

    public ProductReviewSummaryResponse() {
    }

    public ProductReviewSummaryResponse(List<ProductReviewResponse> reviews, boolean canReview, ProductReviewResponse myReview, double averageRating, int reviewCount) {
        this.reviews = reviews;
        this.canReview = canReview;
        this.myReview = myReview;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }

    public List<ProductReviewResponse> getReviews() {
        return reviews;
    }

    public void setReviews(List<ProductReviewResponse> reviews) {
        this.reviews = reviews;
    }

    public boolean isCanReview() {
        return canReview;
    }

    public void setCanReview(boolean canReview) {
        this.canReview = canReview;
    }

    public ProductReviewResponse getMyReview() {
        return myReview;
    }

    public void setMyReview(ProductReviewResponse myReview) {
        this.myReview = myReview;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
    }
}
