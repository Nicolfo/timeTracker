package nicolfo.backend.dto

import java.time.LocalDate

data class DailySummaryDTO(
    val date: LocalDate,
    val totalMinutes: Long,
    val tasks: List<TaskSummaryDTO>
)