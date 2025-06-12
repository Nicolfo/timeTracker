package nicolfo.backend.service

import com.google.firebase.ErrorCode
import com.google.firebase.FirebaseApp
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingException
import com.google.firebase.messaging.Message
import com.google.firebase.messaging.Notification
import nicolfo.backend.entity.FirebaseDeviceInfo
import nicolfo.backend.repository.FirebaseDeviceInfoRepository
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.Date

@Transactional
@Service
class FirebaseMessageServiceImpl (
    private val firebaseDeviceInfoRepository: FirebaseDeviceInfoRepository,
    private val firebaseMessaging: FirebaseMessaging,
    private val timestampService: TimestampService
): FirebaseMessageService {
    override fun saveDeviceToken(firebaseId: String,username:String) {
        val oldRegistration = firebaseDeviceInfoRepository.getReferenceByFirebaseId(firebaseId)
        if(oldRegistration != null){
            oldRegistration.lastActive = Date()
            oldRegistration.username = username
        }
        else{
            firebaseDeviceInfoRepository.save(FirebaseDeviceInfo(firebaseId = firebaseId, lastActive = Date(), username = username))
        }
    }

    override fun sendReminder(message:String) {
        val isMorningMessage = message.contains("morning")
        val devices = firebaseDeviceInfoRepository.findAll()
        val registeredUsers = devices.map { it.username }.distinct()
        val workingUsers = registeredUsers.filter {
            if(isMorningMessage)
                return@filter !timestampService.getCurrentStatus(it).isTaskRunning
            else
                return@filter timestampService.getCurrentStatus(it).isTaskRunning
        }

        devices.filter{workingUsers.contains(it.username)}.forEach {
            sendReminderToDevice(it.firebaseId,message)
        }
    }

    private fun sendReminderToDevice(firebaseId: String, message:String): String? =
        try {
            firebaseMessaging.send(createMessage(firebaseId, message))
        } catch (e: FirebaseMessagingException) {
            if (e.errorCode == ErrorCode.NOT_FOUND) {
                firebaseDeviceInfoRepository.deleteByFirebaseId(firebaseId)
            }
            null
        }

    private fun createMessage(target: String, message:String): Message =
        Message.builder()
            .setToken(target)
            .setNotification(
                Notification.builder()
                    .setBody(message)
                    .setTitle("Time tracker reminder")
                    .build()
            )
            .build()

}