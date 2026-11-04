package com.example.hebekery.dto;

public class UploadResponse {
    private String url;
    private String publicId;
    private String format;
    private long size;

    public UploadResponse() {
    }

    public UploadResponse(String url, String publicId, String format, long size) {
        this.url = url;
        this.publicId = publicId;
        this.format = format;
        this.size = size;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }
}
