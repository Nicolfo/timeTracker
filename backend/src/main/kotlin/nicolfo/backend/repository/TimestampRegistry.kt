package nicolfo.backend.repository

import nicolfo.backend.entity.TimestampEntry
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface TimestampRegistry: JpaRepository<TimestampEntry,Long> {
    fun findAllByUserIdAndTimestampBetweenOrderByTimestampAsc(userId: String, start: LocalDateTime, end: LocalDateTime): List<TimestampEntry>
    fun getFirstByUserIdOrderByTimestampDesc(userId: String): TimestampEntry?
    fun getFirstByUserIdAndTimestampLessThanOrderByTimestampDesc(userId: String, timestamp: LocalDateTime): TimestampEntry?
}