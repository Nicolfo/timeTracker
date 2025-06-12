package nicolfo.backend.controller

import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/user")
class MeController {
    @GetMapping("/logged-in")
    fun loggedIn(
        @AuthenticationPrincipal userDetails: OidcUser?
    ) : Map<String, String>{
        return mapOf(
            "username" to (userDetails?.preferredUsername ?: "anonymous")
        )
    }

}