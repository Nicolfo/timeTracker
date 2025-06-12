package nicolfo.backend.entity

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import java.time.LocalDateTime

@Entity
class TimestampEntry (
    @GeneratedValue
    @Id
    val id: Long? = null,
    val userId: String,
    val timestamp: LocalDateTime,
    val action: Action
)

enum class Action { START, STOP }