package nicolfo.backend.controller

import nicolfo.backend.dto.CurrentStatusDTO
import nicolfo.backend.dto.DailySummaryDTO
import nicolfo.backend.dto.TimestampDTO
import nicolfo.backend.dto.WeeklySummaryDTO
import nicolfo.backend.service.TimestampService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

import nicolfo.backend.entity.Action
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/timestamps")
class TimestampController(private val timestampService: TimestampService) {

    @PostMapping
    fun insertTimestamp(
        @RequestBody request: TimestampDTO?,
        @AuthenticationPrincipal userDetails: OidcUser?
    ): ResponseEntity<Map<String, Long?>> {
        val username = userDetails?.preferredUsername
        val status = timestampService.getCurrentStatus(username)

        // Create a timestamp based on the current context
        val timestampDTO = TimestampDTO(
            request?.timestamp ?: LocalDateTime.now(),
            request?.action ?: if (!status.isTaskRunning) Action.START else Action.STOP
        )

        val id = timestampService.insertTimestamp(timestampDTO, username)
        return ResponseEntity.ok(mapOf("id" to id))
    }

    @GetMapping("/daily/{date}")
    fun getDailySummary(
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate,
        @AuthenticationPrincipal userDetails: OidcUser?
    ): ResponseEntity<DailySummaryDTO> {
        val username = userDetails?.preferredUsername
        val summary = timestampService.getDailySummary(date, username)
        return ResponseEntity.ok(summary)
    }

    @GetMapping("/weekly/{date}")
    fun getWeeklySummary(
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) date: LocalDate,
        @AuthenticationPrincipal userDetails: OidcUser?
    ): ResponseEntity<WeeklySummaryDTO> {
        val username = userDetails?.preferredUsername
        val summary = timestampService.getWeeklySummary(date, username)
        return ResponseEntity.ok(summary)
    }

    @GetMapping("/status")
    fun getCurrentStatus(
        @AuthenticationPrincipal userDetails: OidcUser?
    ): ResponseEntity<CurrentStatusDTO> {
        val username = userDetails?.preferredUsername
        val status = timestampService.getCurrentStatus(username)
        return ResponseEntity.ok(status)
    }
}
