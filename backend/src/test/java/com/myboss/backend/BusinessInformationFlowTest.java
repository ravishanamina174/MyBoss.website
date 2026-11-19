package com.myboss.backend;

import com.myboss.backend.modules.business.dto.UpdateBusinessCardRequest;
import com.myboss.backend.modules.business.dto.UpdateBusinessProfileRequest;
import com.myboss.backend.modules.business.entity.BusinessEntity;
import com.myboss.backend.modules.business.repository.BusinessRepository;
import com.myboss.backend.modules.business.service.BusinessAuthorizationService;
import com.myboss.backend.modules.business.service.BusinessInformationService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BusinessInformationFlowTest {
    @Test
    void savedProfileAndCardCanBePublishedAndReadPublicly() {
        BusinessEntity business = new BusinessEntity("Example Shop");
        ReflectionTestUtils.invokeMethod(business, "onCreate");
        BusinessRepository repository = mock(BusinessRepository.class);
        when(repository.findById(business.getId())).thenReturn(Optional.of(business));
        when(repository.findByPublicIdentifier(business.getPublicIdentifier())).thenReturn(Optional.of(business));
        when(repository.save(any(BusinessEntity.class))).thenAnswer(call -> call.getArgument(0));
        BusinessInformationService service = new BusinessInformationService(
                repository, mock(BusinessAuthorizationService.class));

        var profile = service.updateProfile(business.getId(), new UpdateBusinessProfileRequest(
                "Example Shop", "A friendly place", "hello@example.com", "+123456789",
                "42 Main Street", "", "Colombo", "Western", "10000", "Sri Lanka",
                "https://example.com", "", "", "", "https://images.example.com/logo.png",
                "https://images.example.com/cover.png", List.of("https://images.example.com/one.png")));
        assertEquals("A friendly place", profile.description());
        assertEquals(1, profile.galleryUrls().size());
        assertFalse(profile.profilePublished());

        service.setProfilePublished(business.getId(), true);
        var publicProfile = service.getPublicBusiness(business.getPublicIdentifier());
        assertEquals("A friendly place", publicProfile.description());
        assertEquals(1, publicProfile.galleryUrls().size());

        var card = service.updateCard(business.getId(), new UpdateBusinessCardRequest(
                "Visit our shop", "Sam", "sam@example.com", "+123456789",
                "https://example.com", ""));
        assertEquals("Sam", card.card().contactName());
        service.setCardPublished(business.getId(), true);
        var publicCard = service.getPublicCard(business.getPublicIdentifier());
        assertEquals("Sam", publicCard.contactName());
        assertEquals("https://images.example.com/logo.png", publicCard.logoUrl());
        assertTrue(service.getBusinessInformation(business.getId()).card().published());
    }
}
