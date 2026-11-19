package com.myboss.backend.modules.business.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myboss.backend.modules.business.dto.BusinessInformationResponse;
import com.myboss.backend.modules.business.dto.PublicBusinessResponse;
import com.myboss.backend.modules.business.dto.PublicCardResponse;
import com.myboss.backend.modules.business.dto.UpdateBusinessCardRequest;
import com.myboss.backend.modules.business.dto.UpdateBusinessProfileRequest;
import com.myboss.backend.modules.business.entity.BusinessEntity;
import com.myboss.backend.modules.business.repository.BusinessRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.UUID;

@Service
public class BusinessInformationService {
    private static final TypeReference<List<String>> STRING_LIST =
            new TypeReference<>() {};

    private final BusinessRepository businessRepository;
    private final BusinessAuthorizationService authorizationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public BusinessInformationService(
            BusinessRepository businessRepository,
            BusinessAuthorizationService authorizationService
    ) {
        this.businessRepository = businessRepository;
        this.authorizationService = authorizationService;
    }

    @Transactional(readOnly = true)
    public BusinessInformationResponse getBusinessInformation(UUID businessId) {
        authorizationService.requireOwner(businessId);
        return toInformation(getBusinessOrThrow(businessId));
    }

    @Transactional
    public BusinessInformationResponse updateProfile(
            UUID businessId,
            UpdateBusinessProfileRequest request
    ) {
        authorizationService.requireOwner(businessId);
        validateUrls(request.websiteUrl(), request.facebookUrl(), request.instagramUrl(),
                request.linkedinUrl(), request.profileImageUrl(), request.coverImageUrl());
        List<String> galleryUrls = request.galleryUrls() == null
                ? List.of() : request.galleryUrls();
        galleryUrls.forEach(this::validateUrl);

        BusinessEntity business = getBusinessOrThrow(businessId);
        business.updateProfile(
                request.name().trim(),
                clean(request.description()),
                clean(request.contactEmail()),
                clean(request.phoneNumber()),
                clean(request.addressLine1()),
                clean(request.addressLine2()),
                clean(request.city()),
                clean(request.region()),
                clean(request.postalCode()),
                clean(request.country()),
                clean(request.websiteUrl()),
                clean(request.facebookUrl()),
                clean(request.instagramUrl()),
                clean(request.linkedinUrl()),
                clean(request.profileImageUrl()),
                clean(request.coverImageUrl()),
                writeGallery(galleryUrls)
        );
        return toInformation(businessRepository.save(business));
    }

    @Transactional
    public BusinessInformationResponse updateCard(
            UUID businessId,
            UpdateBusinessCardRequest request
    ) {
        authorizationService.requireOwner(businessId);
        validateUrls(request.websiteUrl(), request.logoUrl());
        BusinessEntity business = getBusinessOrThrow(businessId);
        business.updateCard(
                clean(request.description()),
                clean(request.contactName()),
                clean(request.contactEmail()),
                clean(request.phoneNumber()),
                clean(request.websiteUrl()),
                clean(request.logoUrl())
        );
        return toInformation(businessRepository.save(business));
    }

    @Transactional
    public BusinessInformationResponse setProfilePublished(
            UUID businessId,
            boolean published
    ) {
        authorizationService.requireOwner(businessId);
        BusinessEntity business = getBusinessOrThrow(businessId);
        business.setProfilePublished(published);
        return toInformation(businessRepository.save(business));
    }

    @Transactional
    public BusinessInformationResponse setCardPublished(
            UUID businessId,
            boolean published
    ) {
        authorizationService.requireOwner(businessId);
        BusinessEntity business = getBusinessOrThrow(businessId);
        business.setCardPublished(published);
        return toInformation(businessRepository.save(business));
    }

    @Transactional(readOnly = true)
    public PublicBusinessResponse getPublicBusiness(String publicIdentifier) {
        BusinessEntity business = getByIdentifier(publicIdentifier);
        if (!business.isProfilePublished()) {
            throw unavailable();
        }
        return new PublicBusinessResponse(
                business.getPublicIdentifier(),
                business.getName(),
                business.getProfileDescription(),
                business.getContactEmail(),
                business.getPhoneNumber(),
                business.getAddressLine1(),
                business.getAddressLine2(),
                business.getCity(),
                business.getRegion(),
                business.getPostalCode(),
                business.getCountry(),
                business.getWebsiteUrl(),
                business.getFacebookUrl(),
                business.getInstagramUrl(),
                business.getLinkedinUrl(),
                business.getProfileImageUrl(),
                business.getCoverImageUrl(),
                readGallery(business.getGalleryUrls())
        );
    }

    @Transactional(readOnly = true)
    public PublicCardResponse getPublicCard(String publicIdentifier) {
        BusinessEntity business = getByIdentifier(publicIdentifier);
        if (!business.isCardPublished()) {
            throw unavailable();
        }
        return new PublicCardResponse(
                business.getPublicIdentifier(),
                business.getName(),
                business.getCardDescription(),
                business.getCardContactName(),
                business.getCardContactEmail(),
                business.getCardPhoneNumber(),
                business.getCardWebsiteUrl(),
                business.getCardLogoUrl() == null || business.getCardLogoUrl().isBlank()
                        ? business.getProfileImageUrl() : business.getCardLogoUrl(),
                business.getFacebookUrl(),
                business.getInstagramUrl(),
                business.getLinkedinUrl()
        );
    }

    private BusinessInformationResponse toInformation(BusinessEntity business) {
        return new BusinessInformationResponse(
                business.getId(),
                business.getPublicIdentifier(),
                business.getName(),
                business.getProfileDescription(),
                business.getContactEmail(),
                business.getPhoneNumber(),
                business.getAddressLine1(),
                business.getAddressLine2(),
                business.getCity(),
                business.getRegion(),
                business.getPostalCode(),
                business.getCountry(),
                business.getWebsiteUrl(),
                business.getFacebookUrl(),
                business.getInstagramUrl(),
                business.getLinkedinUrl(),
                business.getProfileImageUrl(),
                business.getCoverImageUrl(),
                readGallery(business.getGalleryUrls()),
                business.isProfilePublished(),
                new BusinessInformationResponse.CardInformation(
                        business.getCardDescription(),
                        business.getCardContactName(),
                        business.getCardContactEmail(),
                        business.getCardPhoneNumber(),
                        business.getCardWebsiteUrl(),
                        business.getCardLogoUrl(),
                        business.isCardPublished()
                ),
                business.getUpdatedAt()
        );
    }

    private BusinessEntity getBusinessOrThrow(UUID businessId) {
        return businessRepository.findById(businessId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Business not found"));
    }

    private BusinessEntity getByIdentifier(String publicIdentifier) {
        if (publicIdentifier == null
                || !publicIdentifier.matches("([a-f0-9]{32}|[a-f0-9-]{36})")) {
            throw unavailable();
        }
        return businessRepository.findByPublicIdentifier(publicIdentifier)
                .orElseThrow(this::unavailable);
    }

    private ResponseStatusException unavailable() {
        return new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Business page is not available");
    }

    private String writeGallery(List<String> galleryUrls) {
        try {
            return objectMapper.writeValueAsString(galleryUrls);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to save gallery images", exception);
        }
    }

    private List<String> readGallery(String galleryUrls) {
        try {
            return objectMapper.readValue(galleryUrls == null ? "[]" : galleryUrls, STRING_LIST);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Business gallery data is invalid", exception);
        }
    }

    private void validateUrls(String... urls) {
        for (String url : urls) {
            if (url != null && !url.isBlank()) {
                validateUrl(url);
            }
        }
    }

    private void validateUrl(String value) {
        try {
            URI uri = new URI(value);
            if (!"https".equalsIgnoreCase(uri.getScheme())
                    && !"http".equalsIgnoreCase(uri.getScheme())) {
                throw new IllegalArgumentException();
            }
        } catch (URISyntaxException | IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Image and website links must be valid HTTP(S) URLs");
        }
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
