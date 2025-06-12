package nicolfo.backend.controller

import nicolfo.backend.dto.FirebaseRegisterDeviceDTO
import nicolfo.backend.service.FirebaseMessageService
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.time.DayOfWeek
import java.time.LocalDateTime
import java.util.Date

@RestController
class FireBaseController(private val firebaseMessageService: FirebaseMessageService) {
    @Scheduled(cron = "0 0 9 * * *")
    fun sendMorningReminder() {
        val today = LocalDateTime.now()

        if (today.dayOfWeek == DayOfWeek.SATURDAY || today.dayOfWeek == DayOfWeek.SUNDAY)
            return
        //TODO Holyday check

        firebaseMessageService.sendReminder("It's morning, remember to register your activity!")
    }

    @Scheduled(cron = "0 00 19 * * *")
    fun sendAfterNoonReminder() {
        val today = LocalDateTime.now()

        if (today.dayOfWeek == DayOfWeek.SATURDAY || today.dayOfWeek == DayOfWeek.SUNDAY)
            return
        //TODO Holyday check

        firebaseMessageService.sendReminder("It's time to go home, remember to stop your registration!")
    }

    @PostMapping("/api/device/register")
    fun registerDeviceToken(@RequestBody firebaseRegisterDeviceDTO: FirebaseRegisterDeviceDTO, @AuthenticationPrincipal userDetails: OidcUser?) {
        firebaseMessageService.saveDeviceToken(firebaseRegisterDeviceDTO.firebaseId,userDetails?.preferredUsername ?: "anonymous")
    }

}