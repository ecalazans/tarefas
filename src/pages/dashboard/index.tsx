import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import styles from "./styles.module.css";

import Head from "next/head";
import { Textarea } from "../../components/textarea"
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import Link from "next/link";

import { db } from "../../services/firebaseConnection"
import { addDoc, collection, query, orderBy, onSnapshot, where, doc, deleteDoc } from "firebase/firestore";

interface DashProps {
  user: {
    email: string
  }
}

interface TaskPropos {
  id: string;
  created: Date;
  public: boolean;
  tarefa: string;
  user: string;
}

export default function Dashboard({ user }: DashProps) {

  const [input, setInput] = useState("")
  const [publicTask, setPublicTask] = useState(false)
  const [tasks, setTasks] = useState<TaskPropos[]>([])

  function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
    setPublicTask(event.target.checked)
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`
    )
    alert('URL copiada com sucesso!')
  }

  async function handleDeleteTask(id: string) {
    const docRef = doc(db, "tarefas", id)

    await deleteDoc(docRef)
  }

  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault()

    if (input === "") return

    try {
      await addDoc(collection(db, "tarefas"), {
        tarefa: input,
        created: new Date(),
        user: user?.email,
        public: publicTask
      })

      alert("Tarefa cadastrada com sucesso!!!")

      setInput("")
      setPublicTask(false)

    } catch (error) {
      console.log(error)
    }

  }

  useEffect(() => {
    async function loadTatefas() {
      const tarefasRef = collection(db, "tarefas")
      const q = query(
        tarefasRef,
        orderBy("created", "desc"),
        where("user", "==", user?.email)
      )

      //onSnapshot
      // sempre fica verificando/observando o banco para caso de laterações
      onSnapshot(q, (snapshot) => {
        let lista = [] as TaskPropos[]

        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            created: doc.data().created,
            public: doc.data().public,
            tarefa: doc.data().tarefa,
            user: doc.data().user,
          })
        })

        setTasks(lista)
      })

    }

    loadTatefas()
  }, [user?.email])

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual sua tarefa ?</h1>

            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder="Digite qual sua tarefa..."
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              />

              <div className={styles.checkboxArea}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label>Deixar tarefa pública ?</label>
              </div>

              <button className={styles.button} type="submit">
                Registrar
              </button>
            </form>
          </div>
        </section>

        <section className={styles.taskContainer}>
          <h1>Minhas tarefas</h1>

          {tasks.map((item) => (
            <article key={item.id} className={styles.task}>
              {item.public && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>PUBLICO</label>
                  <button className={styles.shareButton}
                    onClick={() => handleShare(item.id)}
                  >
                    <FiShare2
                      size={32}
                      color="#3183ff"
                    />
                  </button>
                </div>
              )}
              <div className={styles.taskContent}>
                {item.public ? (
                  <Link href={`/task/${item.id}`}>
                    <p>{item.tarefa}</p>
                  </Link>
                ) : (
                  <p>{item.tarefa}</p>
                )}
                <button className={styles.trashButton}>
                  <FaTrash
                    size={24}
                    color="#ea3140"
                    onClick={() => handleDeleteTask(item.id)}
                  />
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div >
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req })
  // console.log(session)

  if (!session?.user) {
    // se não tem usuário redirecionar para /
    return {
      redirect: {
        destination: "/",
        permanent: false,
      }
    }
  }

  return {
    props: {
      user: {
        email: session?.user?.email
      }
    },
  }
}