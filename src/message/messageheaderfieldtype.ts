/**
 * Well-known type of a message header field
 * @author Michel Kraemer
 */
enum MessageHeaderFieldType {
  DEFAULT,
  TO,
  FROM,
  CONTENT_TYPE,
  BCC,
  CC,
  SUBJECT,
  DATE
}

export default MessageHeaderFieldType;
