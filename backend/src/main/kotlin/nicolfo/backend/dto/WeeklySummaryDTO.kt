package nicolfo.backend.dto

data class WeeklySummaryDTO (
    val totalMinutes: Long,
    val dailySummaries: List<DailySummaryDTO>
)