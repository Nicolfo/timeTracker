package nicolfo.backend.service

import nicolfo.backend.dto.CurrentStatusDTO
import nicolfo.backend.dto.DailySummaryDTO
import nicolfo.backend.dto.TimestampDTO
import nicolfo.backend.dto.WeeklySummaryDTO
import java.time.LocalDate

interface TimestampService {
    fun insertTimestamp(timestampDTO: TimestampDTO, username: String?): Long?
    fun getWeeklySummary(request: LocalDate,username: String?): WeeklySummaryDTO
    fun getDailySummary(request: LocalDate,username: String?): DailySummaryDTO
    fun getCurrentStatus(username: String?): CurrentStatusDTO
}