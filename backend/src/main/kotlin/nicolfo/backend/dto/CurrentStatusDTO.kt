package nicolfo.backend.dto

import java.time.LocalDateTime

data class CurrentStatusDTO(
    val isTaskRunning: Boolean,
    val duration: Long?,   // duration in minutes
    val startTime: LocalDateTime?
)