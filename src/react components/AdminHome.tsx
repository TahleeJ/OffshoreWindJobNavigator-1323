import React, { useEffect, useState } from 'react';
import { setJobOpps, setSurveyResponses, setSurveys } from '../redux/dataSlice.ts';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { changePage, OperationType, PageType } from '../redux/navigationSlice';

import { authInstance } from '../firebase/Firebase';
import { getUser } from '../firebase/Queries/AdminQueries';
import { deleteJobOpp, getJobOpps, newJobOpp } from '../firebase/Queries/JobQueries';
import { deleteSurvey, deleteSurveyResponse, getSurveyResponses, getSurveys } from '../firebase/Queries/SurveyQueries';
import { JobOpp, PermissionLevel } from '../firebase/Types';

import ListViewer from './ListViewer';
import ListElement from './survey/ListElement';


/** The props (arguments) to create this element */
interface props {

}

const AdminHome: React.FC<props> = (props) => {
    const surveys = useAppSelector(s => s.data.surveys);
    const jobOpps = useAppSelector(s => s.data.jobOpps);
    const responses = useAppSelector(s => s.data.surveyResponses);
    const appDispatch = useAppDispatch();
    const user = authInstance.currentUser;
    const [level, setLevel] = useState(PermissionLevel.None);

    const getPermissionLevel = async () => {
        const uid = authInstance.currentUser?.uid!;
        const userDoc = await getUser(uid);

        if (userDoc !== undefined)
            setLevel(userDoc.permissionLevel);
    }
    const levelInfo = () => {
        if (level === PermissionLevel.Owner) return "Owner";
        else if (level === PermissionLevel.Admin) return "Administrator";
        else return "User";
    }

    const scrapeJobs = async () => {
        const response = await fetch('http://api.ecodistricthamptonroads.org/Jobs');
        const jsonResponse = await response.json(); //extract JSON from the http response

        jsonResponse.forEach((jR: any) => {
            const jobOpp: JobOpp = {
                jobName: jR.title,
                companyName: jR.company,
                labelIds: [],
                jobDescription: jR.Description,
            }
            newJobOpp(jobOpp);
        });
    }

    useEffect(() => { getPermissionLevel(); }, []);
    return (
        <div id="adminHome" className='adminContainer'> {/*Contains the whole page*/}
            <div className='topGrid'> {/*top part (notif center, job ops, surveys*/}
                <div className='leftColumn'>
                    <ListViewer height={(document.body.getBoundingClientRect().height - 64) + "px"} title='Responses'>
                        {responses.length > 0 ?
                            responses.map((res, ind) => {
                                return <ListElement
                                    key={ind}
                                    name={res.taker.name}
                                    handleDelete={async () => {
                                        await deleteSurveyResponse(res.id);
                                        appDispatch(setSurveyResponses(await getSurveyResponses()));
                                    }}
                                />
                            })
                            : <div>There are currently no survey responses</div>
                        }
                    </ListViewer>
                </div>
                <div className='middleColumn'>
                    <ListViewer height="50%" title='Job Opportunities' handleNew={() => appDispatch(changePage({ type: PageType.JobManage, operation: OperationType.Creating }))} >
                        {jobOpps.length > 0 ?
                            jobOpps.map((jobOpp, ind) => {
                                return <ListElement
                                    key={ind}
                                    name={jobOpp.jobName}
                                    handleEdit={() => appDispatch(changePage({ type: PageType.JobManage, operation: OperationType.Editing, data: jobOpp }))} // does not actually handle edits yet
                                    handleDelete={async () => {
                                        await deleteJobOpp(jobOpp.id);
                                        appDispatch(setJobOpps(await getJobOpps()));
                                    }}
                                />
                            })
                            : <div>Click the "New" button to create a new job opportunity</div>
                        }
                    </ListViewer>
                    <ListViewer height="50%" title='Survey Templates' handleNew={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Creating }))}>
                        {surveys.length > 0 ?
                            surveys.map((survey, ind) => {
                                return <ListElement
                                    key={ind}
                                    name={survey.title}
                                    handleEdit={() => appDispatch(changePage({ type: PageType.Survey, operation: OperationType.Editing, data: survey }))}
                                    handleDelete={async () => { await deleteSurvey(survey.id); appDispatch(setSurveys(await getSurveys())) }}
                                />
                            })
                            : <div>Click the "New" button to create a new survey template</div>
                        }
                    </ListViewer>
                </div>
                <div className='rightColumn'>
                    <div className="userInfo">
                        <p>
                            {user?.email}
                            <br />
                            {levelInfo()}
                        </p>
                    </div>
                    <div className='adminButtons'>
                        <button onClick={() => { appDispatch(changePage({ type: PageType.LabelManage })) }}>Manage Labels</button>
                        <button onClick={() => { appDispatch(changePage({ type: PageType.AdminManage })) }}>Manage Admins</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminHome;
