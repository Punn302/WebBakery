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
        if (request.isDefaultAddress()) {
            List<Address> userAddresses = getByUser(userId);
            userAddresses.forEach(address -> address.setDefaultAddress(false));
            addressRepository.saveAll(userAddresses);
        }
        Address address = new Address();
        address.setId("ADDR-" + System.currentTimeMillis());
        address.setUserId(userId);
        address.setReceiverName(request.getReceiverName());
        address.setPhone(request.getPhone());
        address.setAddressLine(request.getAddressLine());
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
}
