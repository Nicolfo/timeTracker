package nicolfo.backend.repository

import nicolfo.backend.entity.FirebaseDeviceInfo
import org.springframework.data.jpa.repository.JpaRepository

interface FirebaseDeviceInfoRepository : JpaRepository<FirebaseDeviceInfo, Long>{
    fun deleteByFirebaseId(firebaseId: String)
    fun getReferenceByFirebaseId(firebaseId: String): FirebaseDeviceInfo?
}