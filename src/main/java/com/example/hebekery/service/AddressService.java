package com.example.hebekery.service;

import com.example.hebekery.dto.request.AddressRequest;
import com.example.hebekery.model.Address;
import com.example.hebekery.repository.AddressRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {
    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<Address> getByUser(String userId) {
        return addressRepository.findByUserId(userId);
    }

    public Address save(String userId, AddressRequest request) {
        return save(userId, null, request);
    }

    public Address save(String userId, String addressId, AddressRequest request) {
        if (request.isDefaultAddress()) {
            List<Address> userAddresses = getByUser(userId);
            userAddresses.stream()
                    .filter(address -> addressId == null || !address.getId().equals(addressId))
                    .forEach(address -> address.setDefaultAddress(false));
            addressRepository.saveAll(userAddresses);
        }
        Address address = addressId == null
                ? new Address()
                : addressRepository.findById(addressId)
                    .filter(existing -> existing.getUserId().equals(userId))
                    .orElseThrow(() -> new IllegalArgumentException("Khong tim thay dia chi"));
        if (address.getId() == null) {
            address.setId("ADDR-" + System.currentTimeMillis());
        }
        address.setUserId(userId);
        address.setReceiverName(request.getReceiverName());
        address.setPhone(request.getPhone());
        address.setAddressLine(request.getAddressLine());
        address.setProvince(clean(request.getProvince()));
        address.setDistrict(clean(request.getDistrict()));
        address.setWard(clean(request.getWard()));
        address.setDefaultAddress(request.isDefaultAddress());
        return addressRepository.save(address);
    }

    public boolean delete(String userId, String addressId) {
        return addressRepository.findById(addressId)
                .filter(address -> address.getUserId().equals(userId))
                .map(address -> {
                    addressRepository.delete(address);
                    return true;
                })
                .orElse(false);
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}
