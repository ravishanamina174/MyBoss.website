package com.myboss.backend.modules.business.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;
import java.util.UUID;

@Entity
@Table(name = "businesses")
public class BusinessEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "public_identifier", nullable = false, unique = true, length = 36)
    private String publicIdentifier;

    @Column(name = "profile_description", columnDefinition = "text")
    private String profileDescription;

    @Column(name = "contact_email", length = 320)
    private String contactEmail;

    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    @Column(name = "address_line1", length = 200)
    private String addressLine1;

    @Column(name = "address_line2", length = 200)
    private String addressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "region", length = 100)
    private String region;

    @Column(name = "postal_code", length = 30)
    private String postalCode;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(name = "facebook_url", length = 500)
    private String facebookUrl;

    @Column(name = "instagram_url", length = 500)
    private String instagramUrl;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Column(name = "profile_image_url", length = 1000)
    private String profileImageUrl;

    @Column(name = "cover_image_url", length = 1000)
    private String coverImageUrl;

    @Column(name = "gallery_urls", nullable = false, columnDefinition = "text")
    private String galleryUrls = "[]";

    @Column(name = "profile_published", nullable = false)
    private boolean profilePublished;

    @Column(name = "card_description", length = 500)
    private String cardDescription;

    @Column(name = "card_contact_name", length = 150)
    private String cardContactName;

    @Column(name = "card_contact_email", length = 320)
    private String cardContactEmail;

    @Column(name = "card_phone_number", length = 50)
    private String cardPhoneNumber;

    @Column(name = "card_website_url", length = 500)
    private String cardWebsiteUrl;

    @Column(name = "card_logo_url", length = 1000)
    private String cardLogoUrl;

    @Column(name = "card_published", nullable = false)
    private boolean cardPublished;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected BusinessEntity() {
    }

    public BusinessEntity(String name) {
        this.name = name;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (publicIdentifier == null) {
            publicIdentifier = UUID.randomUUID().toString();
        }

        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPublicIdentifier() { return publicIdentifier; }
    public String getProfileDescription() { return profileDescription; }
    public String getContactEmail() { return contactEmail; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getAddressLine1() { return addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public String getCity() { return city; }
    public String getRegion() { return region; }
    public String getPostalCode() { return postalCode; }
    public String getCountry() { return country; }
    public String getWebsiteUrl() { return websiteUrl; }
    public String getFacebookUrl() { return facebookUrl; }
    public String getInstagramUrl() { return instagramUrl; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public String getCoverImageUrl() { return coverImageUrl; }
    public String getGalleryUrls() { return galleryUrls; }
    public boolean isProfilePublished() { return profilePublished; }
    public String getCardDescription() { return cardDescription; }
    public String getCardContactName() { return cardContactName; }
    public String getCardContactEmail() { return cardContactEmail; }
    public String getCardPhoneNumber() { return cardPhoneNumber; }
    public String getCardWebsiteUrl() { return cardWebsiteUrl; }
    public String getCardLogoUrl() { return cardLogoUrl; }
    public boolean isCardPublished() { return cardPublished; }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void updateProfile(
            String name,
            String profileDescription,
            String contactEmail,
            String phoneNumber,
            String addressLine1,
            String addressLine2,
            String city,
            String region,
            String postalCode,
            String country,
            String websiteUrl,
            String facebookUrl,
            String instagramUrl,
            String linkedinUrl,
            String profileImageUrl,
            String coverImageUrl,
            String galleryUrls
    ) {
        this.name = name;
        this.profileDescription = profileDescription;
        this.contactEmail = contactEmail;
        this.phoneNumber = phoneNumber;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.city = city;
        this.region = region;
        this.postalCode = postalCode;
        this.country = country;
        this.websiteUrl = websiteUrl;
        this.facebookUrl = facebookUrl;
        this.instagramUrl = instagramUrl;
        this.linkedinUrl = linkedinUrl;
        this.profileImageUrl = profileImageUrl;
        this.coverImageUrl = coverImageUrl;
        this.galleryUrls = galleryUrls;
    }

    public void updateCard(
            String cardDescription,
            String cardContactName,
            String cardContactEmail,
            String cardPhoneNumber,
            String cardWebsiteUrl,
            String cardLogoUrl
    ) {
        this.cardDescription = cardDescription;
        this.cardContactName = cardContactName;
        this.cardContactEmail = cardContactEmail;
        this.cardPhoneNumber = cardPhoneNumber;
        this.cardWebsiteUrl = cardWebsiteUrl;
        this.cardLogoUrl = cardLogoUrl;
    }

    public void setProfilePublished(boolean profilePublished) {
        this.profilePublished = profilePublished;
    }

    public void setCardPublished(boolean cardPublished) {
        this.cardPublished = cardPublished;
    }
}