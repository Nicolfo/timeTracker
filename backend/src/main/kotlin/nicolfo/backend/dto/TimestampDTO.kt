package nicolfo.backend.dto

import nicolfo.backend.entity.Action
import java.time.LocalDateTime

data class TimestampDTO(
    val timestamp: LocalDateTime? = null,
    val action: Action? = null
)