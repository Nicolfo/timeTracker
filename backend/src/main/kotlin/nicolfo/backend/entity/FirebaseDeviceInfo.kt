package nicolfo.backend.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import java.util.Date

@Entity
class FirebaseDeviceInfo(
    @GeneratedValue
    @Id
    val id: Long?=null,

    @Column(unique = true)
    val firebaseId: String,
    var lastActive: Date,
    var username: String
)