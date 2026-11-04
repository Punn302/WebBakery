package com.example.hebekery.dto;

import com.example.hebekery.model.Address;

public class AddressResponse {
    private String id;
    private String userId;
    private String receiverName;
    private String phone;
    private String addressLine;
    private String province;
    private String district;
    private String ward;
    private String fullAddress;
    private boolean defaultAddress;

    public AddressResponse() {
    }

    public static AddressResponse from(Address address) {
        if (address == null) {
            return null;
        }
        AddressResponse dto = new AddressResponse();
        dto.setId(address.getId());
        dto.setUserId(address.getUserId());
        dto.setReceiverName(address.getReceiverName());
        dto.setPhone(address.getPhone());
        dto.setAddressLine(address.getAddressLine());
        dto.setProvince(address.getProvince());
        dto.setDistrict(address.getDistrict());
        dto.setWard(address.getWard());
        dto.setDefaultAddress(address.isDefaultAddress());

        StringBuilder full = new StringBuilder();
        if (address.getAddressLine() != null && !address.getAddressLine().isBlank()) {
            full.append(address.getAddressLine());
        }
        if (address.getWard() != null && !address.getWard().isBlank()) {
            if (full.length() > 0) full.append(", ");
            full.append(address.getWard());
        }
        if (address.getDistrict() != null && !address.getDistrict().isBlank()) {
            if (full.length() > 0) full.append(", ");
            full.append(address.getDistrict());
        }
        if (address.getProvince() != null && !address.getProvince().isBlank()) {
            if (full.length() > 0) full.append(", ");
            full.append(address.getProvince());
        }
        dto.setFullAddress(full.toString());

        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getWard() {
        return ward;
    }

    public void setWard(String ward) {
        this.ward = ward;
    }

    public String getFullAddress() {
        return fullAddress;
    }

    public void setFullAddress(String fullAddress) {
        this.fullAddress = fullAddress;
    }

    public boolean isDefaultAddress() {
        return defaultAddress;
    }

    public void setDefaultAddress(boolean defaultAddress) {
        this.defaultAddress = defaultAddress;
    }
}
