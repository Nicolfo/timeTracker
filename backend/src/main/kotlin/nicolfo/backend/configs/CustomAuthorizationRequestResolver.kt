package nicolfo.backend.configs

import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest

class CustomAuthorizationRequestResolver(
    clientRegistrationRepository: ClientRegistrationRepository,
    baseUri: String
) : OAuth2AuthorizationRequestResolver {

    private val defaultResolver = DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, baseUri)

    override fun resolve(request: HttpServletRequest): OAuth2AuthorizationRequest? {
        val originalRequest = defaultResolver.resolve(request)
        return customizeIfNeeded(request, originalRequest)
    }

    override fun resolve(request: HttpServletRequest, clientRegistrationId: String): OAuth2AuthorizationRequest? {
        val originalRequest = defaultResolver.resolve(request, clientRegistrationId)
        return customizeIfNeeded(request, originalRequest)
    }

    private fun customizeIfNeeded(
        request: HttpServletRequest,
        original: OAuth2AuthorizationRequest?
    ): OAuth2AuthorizationRequest? {
        if (original == null) return null

        val promptParam = request.getParameter("prompt")
        return if (promptParam == "none") {
            val additionalParams = HashMap(original.additionalParameters)
            additionalParams["prompt"] = "none"

            OAuth2AuthorizationRequest.from(original)
                .additionalParameters(additionalParams)
                .build()
        } else {
            original
        }
    }
}
