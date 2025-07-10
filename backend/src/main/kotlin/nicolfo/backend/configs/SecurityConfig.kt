package nicolfo.backend.configs

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource


@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@Configuration
class SecurityConfig(
    private val crr: ClientRegistrationRepository,
    @Value("\${external-uri}")
    private val externalUri:String,
    @Value("\${frontend-uri}")
    private val frontendUri:String,
) {
    val customResolver = CustomAuthorizationRequestResolver(crr, "/oauth2/authorization")

    fun oidcLogoutSuccessHandler() = OidcClientInitiatedLogoutSuccessHandler(crr)
        .also { it.setPostLogoutRedirectUri(externalUri) }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOrigins = listOf(frontendUri,externalUri) // Replace with actual frontend URL
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true
        configuration.maxAge = 3600L

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Bean
    fun securityFilterChain(httpSecurity: HttpSecurity): SecurityFilterChain {
        return httpSecurity
            .authorizeHttpRequests { authorizeRequests ->
                authorizeRequests
                    .requestMatchers("/login").permitAll()
                    .requestMatchers("/api/user/logged-in").permitAll()
                    .anyRequest().authenticated()
            }
            .oauth2Login { oauth2 ->
                oauth2.authorizationEndpoint { authEndpoint ->
                    authEndpoint.authorizationRequestResolver(customResolver)
                }.successHandler {  request, response, _ ->
                    response.sendRedirect("$frontendUri/sendPostMessage.html")
                }
                    //add error handler
                .failureHandler { _, response, exception ->
                    if(exception.message?.contains("login_required")==true)
                        response.sendRedirect("$frontendUri/sendPostMessage.html?error=login_required")
                    else
                        response.sendRedirect("$frontendUri/error")
                }
            }
            .logout { it.logoutSuccessHandler(oidcLogoutSuccessHandler()) }
            .csrf { it.disable() }
            .build()
    }

    companion object {
        private val logger = LoggerFactory.getLogger(SecurityConfig::class.java)
    }
}